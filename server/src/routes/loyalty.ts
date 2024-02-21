import { Request, Response, Router } from 'express'
import multer from 'multer'
import path from 'path'
import { DemoLoyalty } from '../app.service'
import { TFile, TReqBody } from './types'

const issuerId = '3388000000022320449'
const classId = `${issuerId}.classId.${String(Date.now())}`
const objectId = `${classId}.objectId.${String(Date.now())}`

// Set up storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // Destination folder where files will be saved
    },
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname + '-' + Date.now() + path.extname(file.originalname),
        )
    },
})

// Set up multer with the storage configuration
const upload = multer({ storage: storage })

export const getLoyaltyRoutes = () => {
    const router = Router()

    router.post('/create-class', async (req: Request, res: Response) => {
        const pass = await new DemoLoyalty().createClass(issuerId, classId)
        res.json(pass)
    })

    router.post('/create-object', async (req: Request, res: Response) => {
        const pass = await new DemoLoyalty().createObject(
            issuerId,
            classId,
            objectId,
        )
        res.json(pass)
    })

    router.post(
        '/create-jwt-object',
        upload.fields([
            { name: 'googlePayLogoImage', maxCount: 1 },
            { name: 'googlePayHeroImage', maxCount: 1 },
        ]),
        async (req: Request<{}, {}, TReqBody>, res: Response) => {
            console.log(req.body)
            console.log(req.files)

            const { googlePayLogoImage, googlePayHeroImage } = req.files as TFile

            const pass = await new DemoLoyalty().createJwtNewObjects(
                issuerId,
                classId,
                objectId,
                req.body,
                googlePayLogoImage[0].filename,
                googlePayHeroImage[0].filename,
            )
            res.json(pass)
        },
    )

    return router
}
