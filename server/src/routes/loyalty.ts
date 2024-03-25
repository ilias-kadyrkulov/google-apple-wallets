import { Request, Response, Router } from 'express'
import mysql from 'mysql'
import multer from 'multer'
import path from 'path'
import { TFile, TReqBody } from '../types'
import DemoLoyalty from '../app.service'

const issuerId = '3388000000022331645'
const classId = `classId.${String(Date.now())}`
const objectId = `objectId.${String(Date.now())}`

//NOTE - Storage для multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') //NOTE - Где будут сохранятся картинки
    },
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        )
    }
})

//NOTE - multer с storage конфигом
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log('Processing file:', file)
        cb(null, true)
    }
})

export const getLoyaltyRoutes = () => {
    const router = Router()

    router.post(
        '/create-jwt-object',
        // upload.fields([ //TODO - Static on Vercel
        //     { name: 'googlePayLogoImage', maxCount: 1 },
        //     { name: 'googlePayHeroImage', maxCount: 1 }
        // ]),
        async (req: Request<{}, {}, TReqBody>, res: Response) => {
            console.log(req.body, ' req.body')
            console.log(req.files, ' req.files')

            try {
                const { name, email, dateOfBirth } = req.body

                // const { googlePayLogoImage, googlePayHeroImage } =
                //    req.files as TFile

                const pass = await DemoLoyalty.createJwtNewObjects(
                    issuerId,
                    classId,
                    objectId,
                    req.body
                    // googlePayLogoImage[0].filename,
                    // googlePayHeroImage[0].filename
                )

                if (!pass) {
                    res.status(400).send('Карточку не удалось создать.')
                }

                const pool = mysql.createPool({
                    connectionLimit: 10,
                    host: process.env.DB_HOST,
                    port: +process.env.DB_PORT!,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB
                })

                pool.getConnection((err, connection) => {
                    if (err) {
                        console.error('Ошибка подключения к базе данных:', err)
                        return
                    }

                    console.log('Успешно подключено к базе данных.')

                    //NOTE - Выполнение простого запроса для проверки
                    connection.query(
                        'SELECT 1 + 1 AS solution',
                        (error, results, fields) => {
                            //NOTE - Возвращаем соединение в пул
                            connection.release()

                            if (error) {
                                console.error(
                                    'Ошибка при выполнении тестового запроса:',
                                    error
                                )
                                return
                            }

                            console.log(
                                'Тестовый запрос успешно выполнен, результат:',
                                results[0].solution
                            )
                        }
                    )
                })

                pool.query(
                    'INSERT INTO customers (name, email, dateOfBirth) VALUES (?, ?, ?)',
                    [name, email, dateOfBirth],
                    (error, results) => {
                        if (error) throw new Error(error.message)

                        const customerId = results.insertId

                        pool.query(
                            'INSERT INTO cards (customer_id) VALUES (?)',
                            [customerId],
                            (error, results) => {
                                if (error) {
                                    //NOTE - Обработка ошибки
                                    console.error(error)
                                    return
                                }

                                //NOTE - Здесь обрабатываем успешное создание карточки
                                console.log(
                                    'Карточка создана с id:',
                                    results.insertId
                                )
                            }
                        )

                        res.json(pass)
                    }
                )
            } catch (error) {
                console.error('Произошла ошибка на сервере:', error)
                res.status(500).send('Внутренняя ошибка сервера')
            }
        }
    )

    return router
}
