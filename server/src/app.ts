import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { getLoyaltyRoutes } from './routes/loyalty'

const app = express()
const PORT = process.env.PORT || 5000
const jsonBodyMiddleware = express.json()

dotenv.config()
app.use(jsonBodyMiddleware)
app.use(cors())
app.use('/uploads', express.static('uploads'))
app.use('/loyalty', getLoyaltyRoutes())

app.get('/', (_, res) => {
    res.json({success: true})
})

app.listen(PORT, () => {
    console.log('Server has started running on port:', PORT)
})
