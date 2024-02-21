
export type TReqBody = {
    issuerName: string
    accountId: string
    accountName: string
    programName: string
    cardColor: string
}

export type TFile = {
    googlePayLogoImage: Express.Multer.File[]
    googlePayHeroImage: Express.Multer.File[]
}