/*
 * Copyright 2022 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START setup]
// [START imports]
import { GoogleAuth } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { TReqBody } from './types'
// [END imports]

/**
 * Demo class for creating and managing Event tickets in Google Wallet.
 */

class DemoLoyalty {
    baseUrl: string
    batchUrl: string
    classUrl: string
    objectUrl: string
    credentials: any
    httpClient: any

    currentDate: Date
    oneWeekLater: Date

    formattedCurrentDate: { date: string }
    formattedOneWeekLater: { date: string }

    constructor() {
        /**
         * Path to service account key file from Google Cloud Console. Environment
         * variable: GOOGLE_APPLICATION_CREDENTIALS.
         */
        this.currentDate = new Date()
        this.oneWeekLater = new Date(this.currentDate)
        this.oneWeekLater.setDate(this.currentDate.getDate() + 7)

        this.formattedCurrentDate = {
            date: this.currentDate.toISOString()
        }

        this.formattedOneWeekLater = {
            date: this.oneWeekLater.toISOString()
        }

        this.baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1'
        this.batchUrl = 'https://walletobjects.googleapis.com/batch'
        this.classUrl = `${this.baseUrl}/loyaltyClass`
        this.objectUrl = `${this.baseUrl}/loyaltyObject`

        this.auth()
    }
    // [END setup]

    // [START auth]
    /**
     * Create authenticated HTTP client using a service account file.
     */
    auth() {
        this.credentials = require(process.env.GOOGLE_APPLICATION_CREDENTIALS ||
            '../service.json')
        console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'auth')

        this.httpClient = new GoogleAuth({
            credentials: this.credentials,
            scopes: 'https://www.googleapis.com/auth/wallet_object.issuer'
        })
    }
    // [END auth]

    // [START createClass]
    /**
     * Create a class.
     *
     * @param {string} issuerId The issuer ID being used for this request.
     * @param {string} classSuffix Developer-defined unique ID for this pass class.
     *
     * @returns {string} The pass class ID: `${issuerId}.${classSuffix}`
     */
    async createClass(issuerId: string, classSuffix: string): Promise<string> {
        let response

        // Check if the class exists
        try {
            response = await this.httpClient.request({
                url: `${this.classUrl}/${issuerId}.${classSuffix}`,
                method: 'GET'
            })

            console.log(`Class ${issuerId}.${classSuffix} already exists!`)

            return `${issuerId}.${classSuffix}`
        } catch (err: any) {
            if (err.response && err.response.status !== 404) {
                // Something else went wrong...
                console.log(err)
                return `${issuerId}.${classSuffix}`
            }
        }

        // See link below for more information on required properties
        // https://developers.google.com/wallet/retail/loyalty-cards/rest/v1/loyaltyclass
        let newClass = {
            id: `${issuerId}.${classSuffix}`,
            issuerName: 'Issuer name',
            reviewStatus: 'UNDER_REVIEW',
            programName: 'Program name',
            programLogo: {
                sourceUri: {
                    uri: 'http://farm8.staticflickr.com/7340/11177041185_a61a7f2139_o.jpg'
                },
                contentDescription: {
                    defaultValue: {
                        language: 'en-US',
                        value: 'Logo description'
                    }
                }
            }
        }

        response = await this.httpClient.request({
            url: this.classUrl,
            method: 'POST',
            data: newClass
        })

        console.log('Class insert response')
        console.log(response)

        return `${issuerId}.${classSuffix}`
    }
    // [END createClass]

    // [START updateClass]
    /**
     * Update a class.
     *
     * **Warning:** This replaces all existing class attributes!
     *
     * @param {string} issuerId The issuer ID being used for this request.
     * @param {string} classSuffix Developer-defined unique ID for this pass class.
     *
     * @returns {string} The pass class ID: `${issuerId}.${classSuffix}`
     */
    async updateClass(issuerId: string, classSuffix: string): Promise<string> {
        let response

        // Check if the class exists
        try {
            response = await this.httpClient.request({
                url: `${this.classUrl}/${issuerId}.${classSuffix}`,
                method: 'GET'
            })
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                console.log(`Class ${issuerId}.${classSuffix} not found!`)
                return `${issuerId}.${classSuffix}`
            } else {
                // Something else went wrong...
                console.log(err)
                return `${issuerId}.${classSuffix}`
            }
        }

        // Class exists
        let updatedClass = response.data

        // Update the class by adding a homepage
        updatedClass['homepageUri'] = {
            uri: 'https://developers.google.com/wallet',
            description: 'Homepage description'
        }

        // Note: reviewStatus must be 'UNDER_REVIEW' or 'DRAFT' for updates
        updatedClass['reviewStatus'] = 'UNDER_REVIEW'

        response = await this.httpClient.request({
            url: `${this.classUrl}/${issuerId}.${classSuffix}`,
            method: 'PUT',
            data: updatedClass
        })

        console.log('Class update response')
        console.log(response)

        return `${issuerId}.${classSuffix}`
    }
    // [END updateClass]

    // [START patchClass]
    /**
     * Patch a class.
     *
     * The PATCH method supports patch semantics.
     *
     * @param {string} issuerId The issuer ID being used for this request.
     * @param {string} classSuffix Developer-defined unique ID for this pass class.
     *
     * @returns {string} The pass class ID: `${issuerId}.${classSuffix}`
     */
    async patchClass(issuerId: any, classSuffix: any): Promise<string> {
        let response

        // Check if the class exists
        try {
            response = await this.httpClient.request({
                url: `${this.classUrl}/${issuerId}.${classSuffix}`,
                method: 'GET'
            })
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                console.log(`Class ${issuerId}.${classSuffix} not found!`)
                return `${issuerId}.${classSuffix}`
            } else {
                // Something else went wrong...
                console.log(err)
                return `${issuerId}.${classSuffix}`
            }
        }

        // Patch the class by adding a homepage
        let patchBody = {
            homepageUri: {
                uri: 'https://developers.google.com/wallet',
                description: 'Homepage description'
            },

            // Note: reviewStatus must be 'UNDER_REVIEW' or 'DRAFT' for updates
            reviewStatus: 'UNDER_REVIEW'
        }

        response = await this.httpClient.request({
            url: `${this.classUrl}/${issuerId}.${classSuffix}`,
            method: 'PATCH',
            data: patchBody
        })

        console.log('Class patch response')
        console.log(response)

        return `${issuerId}.${classSuffix}`
    }
    // [END patchClass]

    // [START addMessageClass]
    /**
     * Add a message to a pass class.
     *
     * @param {string} issuerId The issuer ID being used for this request.
     * @param {string} classSuffix Developer-defined unique ID for this pass class.
     * @param {string} header The message header.
     * @param {string} body The message body.
     *
     * @returns {string} The pass class ID: `${issuerId}.${classSuffix}`
     */
    async addClassMessage(
        issuerId: string,
        classSuffix: string,
        header: string,
        body: string
    ): Promise<string> {
        let response

        // Check if the class exists
        try {
            response = await this.httpClient.request({
                url: `${this.classUrl}/${issuerId}.${classSuffix}`,
                method: 'GET'
            })
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                console.log(`Class ${issuerId}.${classSuffix} not found!`)
                return `${issuerId}.${classSuffix}`
            } else {
                // Something else went wrong...
                console.log(err)
                return `${issuerId}.${classSuffix}`
            }
        }

        response = await this.httpClient.request({
            url: `${this.classUrl}/${issuerId}.${classSuffix}/addMessage`,
            method: 'POST',
            data: {
                message: {
                    header: header,
                    body: body
                }
            }
        })

        console.log('Class addMessage response')
        console.log(response)

        return `${issuerId}.${classSuffix}`
    }
    // [END addMessageClass]

    // [START createObject]
    /**
     * Create an object.
     *
     * @param {string} issuerId The issuer ID being used for this request.
     * @param {string} classSuffix Developer-defined unique ID for the pass class.
     * @param {string} objectSuffix Developer-defined unique ID for the pass object.
     *
     * @returns {string} The pass object ID: `${issuerId}.${objectSuffix}`
     */
    async createObject(
        issuerId: string,
        classSuffix: string,
        objectSuffix: string
    ): Promise<string> {
        let response

        // Check if the object exists
        try {
            response = await this.httpClient.request({
                url: `${this.objectUrl}/${issuerId}.${objectSuffix}`,
                method: 'GET'
            })

            console.log(`Object ${issuerId}.${objectSuffix} already exists!`)

            return `${issuerId}.${objectSuffix}`
        } catch (err: any) {
            if (err.response && err.response.status !== 404) {
                // Something else went wrong...
                console.log(err)
                return `${issuerId}.${objectSuffix}`
            }
        }

        // See link below for more information on required properties
        // https://developers.google.com/wallet/retail/loyalty-cards/rest/v1/loyaltyobject
        let newObject = {
            id: `${issuerId}.${objectSuffix}`,
            classId: `${issuerId}.${classSuffix}`,
            state: 'ACTIVE',
            //NOTE - Картинка на главной снизу
            heroImage: {
                sourceUri: {
                    uri: 'https://farm4.staticflickr.com/3723/11177041115_6e6a3b6f49_o.jpg'
                },
                contentDescription: {
                    defaultValue: {
                        language: 'en-US',
                        value: 'Hero image description'
                    }
                }
            },
            //NOTE - Заголовки под main image в сведениях
            textModulesData: [
                {
                    header: 'Text module header',
                    body: 'Text module body',
                    id: 'TEXT_MODULE_ID'
                }
            ],
            //NOTE - Линки в сведениях
            linksModuleData: {
                uris: [
                    {
                        uri: 'https://crm.kg',
                        description: 'Link module URI description',
                        id: 'LINK_MODULE_URI_ID'
                    },
                    {
                        uri: 'tel:0700205314',
                        description: 'Support',
                        id: 'LINK_MODULE_TEL_ID'
                    }
                ]
            },
            //NOTE - Main image в сведениях
            imageModulesData: [
                {
                    mainImage: {
                        sourceUri: {
                            uri: 'http://farm4.staticflickr.com/3738/12440799783_3dc3c20606_b.jpg'
                        },
                        contentDescription: {
                            defaultValue: {
                                language: 'en-US',
                                value: 'Image module description'
                            }
                        }
                    },
                    id: 'IMAGE_MODULE_ID'
                }
            ],
            barcode: {
                type: 'QR_CODE',
                value: 'QR code'
            },
            locations: [
                {
                    latitude: 37.424015499999996,
                    longitude: -122.09259560000001
                }
            ],
            accountId: 'Account id',
            accountName: 'Account name',
            loyaltyPoints: {
                label: 'Points',
                balance: {
                    int: 800
                }
            },
            secondaryLoyaltyPoints: {
                label: 'Bonuses',
                balance: {
                    int: 500
                }
            },
            validTimeInterval: {
                start: {
                    date: new Date()
                },
                end: {
                    date: new Date()
                }
            }
        }

        response = await this.httpClient.request({
            url: this.objectUrl,
            method: 'POST',
            data: newObject
        })

        console.log('Object insert response')
        console.log(response)

        return `${issuerId}.${objectSuffix}`
    }
    // [END createObject]

    // [START updateObject]
    /**
     * Update an object.
     *
     * **Warning:** This replaces all existing object attributes!
     *
     * @param {string} issuerId The issuer ID being used for this request.
     * @param {string} objectSuffix Developer-defined unique ID for the pass object.
     *
     * @returns {string} The pass object ID: `${issuerId}.${objectSuffix}`
     */
    async updateObject(
        issuerId: string,
        objectSuffix: string
    ): Promise<string> {
        let response

        // Check if the object exists
        try {
            response = await this.httpClient.request({
                url: `${this.objectUrl}/${issuerId}.${objectSuffix}`,
                method: 'GET'
            })
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                console.log(`Object ${issuerId}.${objectSuffix} not found!`)
                return `${issuerId}.${objectSuffix}`
            } else {
                // Something else went wrong...
                console.log(err)
                return `${issuerId}.${objectSuffix}`
            }
        }

        // Object exists
        let updatedObject = response.data

        // Update the object by adding a link
        let newLink = {
            uri: 'https://developers.google.com/wallet',
            description: 'New link description'
        }
        if (updatedObject['linksModuleData'] === undefined) {
            updatedObject['linksModuleData'] = {
                uris: [newLink]
            }
        } else {
            updatedObject['linksModuleData']['uris'].push(newLink)
        }

        response = await this.httpClient.request({
            url: `${this.objectUrl}/${issuerId}.${objectSuffix}`,
            method: 'PUT',
            data: updatedObject
        })

        console.log('Object update response')
        console.log(response)

        return `${issuerId}.${objectSuffix}`
    }
    // [END updateObject]

    // [START patchObject]
    /**
     * Patch an object.
     *
     * @param {string} issuerId The issuer ID being used for this request.
     * @param {string} objectSuffix Developer-defined unique ID for the pass object.
     *
     * @returns {string} The pass object ID: `${issuerId}.${objectSuffix}`
     */
    async patchObject(issuerId: string, objectSuffix: string): Promise<string> {
        let response

        // Check if the object exists
        try {
            response = await this.httpClient.request({
                url: `${this.objectUrl}/${issuerId}.${objectSuffix}`,
                method: 'GET'
            })
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                console.log(`Object ${issuerId}.${objectSuffix} not found!`)
                return `${issuerId}.${objectSuffix}`
            } else {
                // Something else went wrong...
                console.log(err)
                return `${issuerId}.${objectSuffix}`
            }
        }

        // Object exists
        let existingObject = response.data

        // Patch the object by adding a link
        let newLink = {
            uri: 'https://developers.google.com/wallet',
            description: 'New link description'
        }

        let patchBody: any = {}
        if (existingObject['linksModuleData'] === undefined) {
            patchBody['linksModuleData'] = {
                uris: []
            }
        } else {
            patchBody['linksModuleData'] = {
                uris: existingObject['linksModuleData']['uris']
            }
        }
        patchBody['linksModuleData']['uris'].push(newLink)

        response = await this.httpClient.request({
            url: `${this.objectUrl}/${issuerId}.${objectSuffix}`,
            method: 'PATCH',
            data: patchBody
        })

        console.log('Object patch response')
        console.log(response)

        return `${issuerId}.${objectSuffix}`
    }
    // [END patchObject]

    // [START expireObject]
    /**
     * Expire an object.
     *
     * Sets the object's state to Expired. If the valid time interval is
     * already set, the pass will expire automatically up to 24 hours after.
     *
     * @param {string} issuerId The issuer ID being used for this request.
     * @param {string} objectSuffix Developer-defined unique ID for the pass object.
     *
     * @returns {string} The pass object ID: `${issuerId}.${objectSuffix}`
     */
    async expireObject(
        issuerId: string,
        objectSuffix: string
    ): Promise<string> {
        let response

        // Check if the object exists
        try {
            response = await this.httpClient.request({
                url: `${this.objectUrl}/${issuerId}.${objectSuffix}`,
                method: 'GET'
            })
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                console.log(`Object ${issuerId}.${objectSuffix} not found!`)
                return `${issuerId}.${objectSuffix}`
            } else {
                // Something else went wrong...
                console.log(err)
                return `${issuerId}.${objectSuffix}`
            }
        }

        // Patch the object, setting the pass as expired
        let patchBody = {
            state: 'EXPIRED'
        }

        response = await this.httpClient.request({
            url: `${this.objectUrl}/${issuerId}.${objectSuffix}`,
            method: 'PATCH',
            data: patchBody
        })

        console.log('Object expiration response')
        console.log(response)

        return `${issuerId}.${objectSuffix}`
    }
    // [END expireObject]

    // [START addMessageObject]
    /**
     * Add a message to a pass object.
     *
     * @param {string} issuerId The issuer ID being used for this request.
     * @param {string} objectSuffix Developer-defined unique ID for this pass object.
     * @param {string} header The message header.
     * @param {string} body The message body.
     *
     * @returns {string} The pass class ID: `${issuerId}.${classSuffix}`
     */
    async addObjectMessage(
        issuerId: string,
        objectSuffix: string,
        header: string,
        body: string
    ): Promise<string> {
        let response

        // Check if the object exists
        try {
            response = await this.httpClient.request({
                url: `${this.objectUrl}/${issuerId}.${objectSuffix}`,
                method: 'GET'
            })
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                console.log(`Object ${issuerId}.${objectSuffix} not found!`)
                return `${issuerId}.${objectSuffix}`
            } else {
                // Something else went wrong...
                console.log(err)
                return `${issuerId}.${objectSuffix}`
            }
        }

        response = await this.httpClient.request({
            url: `${this.objectUrl}/${issuerId}.${objectSuffix}/addMessage`,
            method: 'POST',
            data: {
                message: {
                    header: header,
                    body: body
                }
            }
        })

        console.log('Object addMessage response')
        console.log(response)

        return `${issuerId}.${objectSuffix}`
    }
    // [END addMessageObject]

    // [START jwtNew]
    /**
     * Generate a signed JWT that creates a new pass class and object.
     *
     * When the user opens the "Add to Google Wallet" URL and saves the pass to
     * their wallet, the pass class and object defined in the JWT are
     * created. This allows you to create multiple pass classes and objects in
     * one API call when the user saves the pass to their wallet.
     *
     * @param {string} issuerId The issuer ID being used for this request.
     * @param {string} classSuffix Developer-defined unique ID for the pass class.
     * @param {string} objectSuffix Developer-defined unique ID for the pass object.
     *
     * @returns {string} An "Add to Google Wallet" link.
     */
    check(): string {
        console.log('check func')

        return 'working'
    }
    async createJwtNewObjects(
        issuerId: string,
        classSuffix: string,
        objectSuffix: string,
        {
            cardColor = '#ff9f99',
            name = 'Ilias',
            email = 'ilias.kadyrkulov@gmail.com',
            dateOfBirth = '12-05-2001'
        }: TReqBody,
        googlePayLogoImage?: string,
        googlePayHeroImage?: string
    ): Promise<string> {
        // See link below for more information on required properties
        // https://developers.google.com/wallet/retail/loyalty-cards/rest/v1/loyaltyclass
        let newClass = {
            id: `${issuerId}.${classSuffix}`,
            issuerName: 'Asia Store',
            reviewStatus: 'UNDER_REVIEW',
            programName: 'Карта постоянного клиента',
            programLogo: {
                sourceUri: {
                    uri:
                        // 'http://localhost:5000/uploads/' +
                        //     googlePayLogoImage ||
                        'https://i.imgur.com/kJtCq0o.png'
                },
                contentDescription: {
                    defaultValue: {
                        language: 'en-US',
                        value: 'Logo description'
                    }
                }
            },
            hexBackgroundColor: '#4285f4'
        }
        //ANCHOR - JWT Object creation
        // See link below for more information on required properties
        // https://developers.google.com/wallet/retail/loyalty-cards/rest/v1/loyaltyobject
        let newObject = {
            id: `${issuerId}.${objectSuffix}`,
            classId: `${issuerId}.${classSuffix}`,
            state: 'ACTIVE',
            heroImage: {
                sourceUri: {
                    uri:
                        // 'http://localhost:5000/uploads/' +
                        //     googlePayHeroImage ||
                        'https://i.imgur.com/qcFAdv7.png'
                },
                contentDescription: {
                    defaultValue: {
                        language: 'en-US',
                        value: 'Asia Store — официальный магазин техники Apple со статусом Apple Authorized Reseller и официальный реселлер Garmin в Кыргызстане, а также официальный дистрибьютор JBL & Harman Kardon и умных устройств от Яндекс.Hero image description'
                    }
                }
            },
            textModulesData: [
                {
                    header: `День рождения: ${dateOfBirth}`,
                    body: `E-mail: ${email}`,
                    id: 'TEXT_MODULE_ID'
                }
            ],
            linksModuleData: {
                uris: [
                    {
                        uri: 'https://asiastore.kg',
                        description: `Asia Store's website`,
                        id: 'LINK_MODULE_URI_ID'
                    },
                    {
                        uri: 'tel:0700205314',
                        description: 'Support',
                        id: 'LINK_MODULE_TEL_ID'
                    }
                ]
            },
            imageModulesData: [
                {
                    mainImage: {
                        sourceUri: {
                            uri: 'https://i.imgur.com/ioFwt7x.png'
                        },
                        contentDescription: {
                            defaultValue: {
                                language: 'en-US',
                                value: 'Image module description'
                            }
                        }
                    },
                    id: 'IMAGE_MODULE_ID'
                }
            ],
            barcode: {
                type: 'QR_CODE',
                value: 'https://asiastore.kg/'
            },
            locations: [
                {
                    latitude: 37.424015499999996,
                    longitude: -122.09259560000001
                }
            ],
            accountId: 'accountId',
            accountName: name,
            loyaltyPoints: {
                label: 'Уровень лояльности',
                balance: {
                    string: '5%'
                }
            },
            secondaryLoyaltyPoints: {
                label: 'Баллы',
                balance: {
                    int: 50
                }
            },
            validTimeInterval: {
                start: this.formattedCurrentDate,
                end: this.formattedOneWeekLater
            }
        }

        // Create the JWT claims
        let claims = {
            iss: this.credentials.client_email,
            aud: 'google',
            origins: ['www.example.com'],
            typ: 'savetowallet',
            payload: {
                loyaltyClasses: [newClass],
                loyaltyObjects: [newObject]
            }
        }

        // The service account credentials are used to sign the JWT
        let token = jwt.sign(claims, this.credentials.private_key, {
            algorithm: 'RS256'
        })

        console.log('Add to Google Wallet link')
        console.log(`https://pay.google.com/gp/v/save/${token}`)

        return `https://pay.google.com/gp/v/save/${token}`
    }
    // [END jwtNew]

    // [START jwtExisting]
    /**
     * Generate a signed JWT that references an existing pass object.
     *
     * When the user opens the "Add to Google Wallet" URL and saves the pass to
     * their wallet, the pass objects defined in the JWT are added to the
     * user's Google Wallet app. This allows the user to save multiple pass
     * objects in one API call.
     *
     * The objects to add must follow the below format:
     *
     *  {
     *    'id': 'ISSUER_ID.OBJECT_SUFFIX',
     *    'classId': 'ISSUER_ID.CLASS_SUFFIX'
     *  }
     *
     * @param {string} issuerId The issuer ID being used for this request.
     *
     * @returns {string} An "Add to Google Wallet" link.
     */
    createJwtExistingObjects(issuerId: string): string {
        // Multiple pass types can be added at the same time
        // At least one type must be specified in the JWT claims
        // Note: Make sure to replace the placeholder class and object suffixes
        let objectsToAdd = {
            // Event tickets
            eventTicketObjects: [
                {
                    id: `${issuerId}.EVENT_OBJECT_SUFFIX`,
                    classId: `${issuerId}.EVENT_CLASS_SUFFIX`
                }
            ],

            // Boarding passes
            flightObjects: [
                {
                    id: `${issuerId}.FLIGHT_OBJECT_SUFFIX`,
                    classId: `${issuerId}.FLIGHT_CLASS_SUFFIX`
                }
            ],

            // Generic passes
            genericObjects: [
                {
                    id: `${issuerId}.GENERIC_OBJECT_SUFFIX`,
                    classId: `${issuerId}.GENERIC_CLASS_SUFFIX`
                }
            ],

            // Gift cards
            giftCardObjects: [
                {
                    id: `${issuerId}.GIFT_CARD_OBJECT_SUFFIX`,
                    classId: `${issuerId}.GIFT_CARD_CLASS_SUFFIX`
                }
            ],

            // Loyalty cards
            loyaltyObjects: [
                {
                    id: `${issuerId}.LOYALTY_OBJECT_SUFFIX`,
                    classId: `${issuerId}.LOYALTY_CLASS_SUFFIX`
                }
            ],

            // Offers
            offerObjects: [
                {
                    id: `${issuerId}.OFFER_OBJECT_SUFFIX`,
                    classId: `${issuerId}.OFFER_CLASS_SUFFIX`
                }
            ],

            // Transit passes
            transitObjects: [
                {
                    id: `${issuerId}.TRANSIT_OBJECT_SUFFIX`,
                    classId: `${issuerId}.TRANSIT_CLASS_SUFFIX`
                }
            ]
        }

        // Create the JWT claims
        let claims = {
            iss: this.credentials.client_email,
            aud: 'google',
            origins: ['www.example.com'],
            typ: 'savetowallet',
            payload: objectsToAdd
        }

        // The service account credentials are used to sign the JWT
        let token = jwt.sign(claims, this.credentials.private_key, {
            algorithm: 'RS256'
        })

        console.log('Add to Google Wallet link')
        console.log(`https://pay.google.com/gp/v/save/${token}`)

        return `https://pay.google.com/gp/v/save/${token}`
    }
    // [END jwtExisting]

    // [START batch]
    /**
     * Batch create Google Wallet objects from an existing class.
     *
     * @param {string} issuerId The issuer ID being used for this request.
     * @param {string} classSuffix Developer-defined unique ID for this pass class.
     */
    async batchCreateObjects(issuerId: string, classSuffix: string) {
        // See below for more information
        // https://cloud.google.com/compute/docs/api/how-tos/batch#example
        let data = ''
        let batchObject
        let objectSuffix

        // Example: Generate three new pass objects
        for (let i = 0; i < 3; i++) {
            // Generate a random object suffix
            objectSuffix = uuidv4().replace('[^w.-]', '_')

            // See link below for more information on required properties
            // https://developers.google.com/wallet/retail/loyalty-cards/rest/v1/loyaltyobject
            batchObject = {
                id: `${issuerId}.${objectSuffix}`,
                classId: `${issuerId}.${classSuffix}`,
                state: 'ACTIVE',
                heroImage: {
                    sourceUri: {
                        uri: 'https://farm4.staticflickr.com/3723/11177041115_6e6a3b6f49_o.jpg'
                    },
                    contentDescription: {
                        defaultValue: {
                            language: 'en-US',
                            value: 'Hero image description'
                        }
                    }
                },
                textModulesData: [
                    {
                        header: 'Text module header',
                        body: 'Text module body',
                        id: 'TEXT_MODULE_ID'
                    }
                ],
                linksModuleData: {
                    uris: [
                        {
                            uri: 'http://maps.google.com/',
                            description: 'Link module URI description',
                            id: 'LINK_MODULE_URI_ID'
                        },
                        {
                            uri: 'tel:6505555555',
                            description: 'Link module tel description',
                            id: 'LINK_MODULE_TEL_ID'
                        }
                    ]
                },
                imageModulesData: [
                    {
                        mainImage: {
                            sourceUri: {
                                uri: 'http://farm4.staticflickr.com/3738/12440799783_3dc3c20606_b.jpg'
                            },
                            contentDescription: {
                                defaultValue: {
                                    language: 'en-US',
                                    value: 'Image module description'
                                }
                            }
                        },
                        id: 'IMAGE_MODULE_ID'
                    }
                ],
                barcode: {
                    type: 'QR_CODE',
                    value: 'QR code'
                },
                locations: [
                    {
                        latitude: 37.424015499999996,
                        longitude: -122.09259560000001
                    }
                ],
                accountId: 'Account id',
                accountName: 'Account name',
                loyaltyPoints: {
                    label: 'Points',
                    balance: {
                        int: 800
                    }
                }
            }

            data += '--batch_createobjectbatch\n'
            data += 'Content-Type: application/json\n\n'
            data += 'POST /walletobjects/v1/loyaltyObject\n\n'

            data += JSON.stringify(batchObject) + '\n\n'
        }
        data += '--batch_createobjectbatch--'

        // Invoke the batch API calls
        let response = await this.httpClient.request({
            url: this.batchUrl, // https://walletobjects.googleapis.com/batch
            method: 'POST',
            data: data,
            headers: {
                // `boundary` is the delimiter between API calls in the batch request
                'Content-Type':
                    'multipart/mixed; boundary=batch_createobjectbatch'
            }
        })

        console.log('Batch insert response')
        console.log(response)
    }
    // [END batch]
}

export default new DemoLoyalty()
