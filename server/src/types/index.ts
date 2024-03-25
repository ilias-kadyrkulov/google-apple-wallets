export type TReqBody = {
    name: string
    email: string
    dateOfBirth: string
    cardColor: string
}

export type TFile = {
    googlePayLogoImage: Express.Multer.File[]
    googlePayHeroImage: Express.Multer.File[]
}