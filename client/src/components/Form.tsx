import { ChangeEvent, FormEvent, useState } from 'react'
import { PhotoshopPicker } from 'react-color'
import { ColorPickerType, LoyaltyType } from './types'
import imageCompression from 'browser-image-compression'
import axios from 'axios'

type TForm = {
    name: string
    surname: string
    age: number | null
    cardColorActual: string
    cardColorTemp: string
}

export default function Form() {
    // const [loyaltyParams, setLoyaltyParams] = useState<LoyaltyType>({
    //     programName: '',
    //     cardColorActual: '#222',
    //     cardColorTemp: '#222',
    //     googlePayLogoImage: null,
    //     googlePayHeroImage: null
    // })
    const [loyaltyParams, setLoyaltyParams] = useState<TForm>({
        name: '',
        surname: '',
        cardColorActual: '#222',
        cardColorTemp: '#222',
        age: null
    })
    const [isColorPickerActive, setIsColorPickerActive] = useState(false)

    const handleColorPicker = () => {
        setIsColorPickerActive(true)
    }

    const onColorPickerCanceled = () => {
        setLoyaltyParams({
            ...loyaltyParams,
            cardColorTemp: loyaltyParams.cardColorActual
        })
        setIsColorPickerActive(false)
    }

    const onColorPickerAccepted = () => {
        setLoyaltyParams({
            ...loyaltyParams,
            cardColorActual: loyaltyParams.cardColorTemp
        })
        setIsColorPickerActive(false)
    }

    const handleCardColorChange = (color: ColorPickerType) => {
        setLoyaltyParams({ ...loyaltyParams, cardColorTemp: color.hex })
    }

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const { name } = e.target
        setLoyaltyParams({
            ...loyaltyParams,
            [name]: e.target.files && e.target.files[0]
        })
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setLoyaltyParams(prevParams => ({ ...prevParams, [name]: value }))
    }

    const createLoyaltyObject = async ({ name, surname }: TForm) => {
        // const options = {
        //     maxSizeMB: 1,
        //     maxWidthOrHeight: 1920,
        //     useWebWorker: true
        // }

        // const compressedGoogleLogo = await imageCompression(
        //     googlePayLogoImage,
        //     options
        // )

        // const compressedGoogleHero = await imageCompression(
        //     googlePayHeroImage,
        //     options
        // )

        // console.log(compressedGoogleHero, compressedGoogleLogo)

        const formData = new FormData()
        formData.append('name', name)
        formData.append('surname', surname)
        // formData.append(
        //     'googlePayLogoImage',
        //     compressedGoogleLogo,
        //     'googlePayLogoImage.png'
        // )
        // formData.append(
        //     'googlePayHeroImage',
        //     compressedGoogleHero,
        //     'googlePayHeroImage.png'
        // )

        try {
            const res = await axios.post(
                'http://localhost:5000/loyalty/create-jwt-object',
                formData
            )

            return res.data
        } catch (error) {
            alert(error)
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            const walletRedirectPath = await createLoyaltyObject(loyaltyParams)
            console.log('Создана карта лояльности:', walletRedirectPath)
            window.open(walletRedirectPath, '_blank')
            setLoyaltyParams({
                name: '',
                surname: '',
                cardColorActual: '#222',
                cardColorTemp: '#222',
                age: null
            })
        } catch (error: any) {
            console.error('Ошибка создания карты лояльности:', error.message)
        }
    }
    return (
        <form
            onSubmit={handleSubmit}
            className='flex flex-col pl-1 w-[300px]'
        >
            <label className='form-item'>
                <p>Название программы:</p>

                <input
                    type='text'
                    name='name'
                    value={loyaltyParams.name}
                    onChange={handleInputChange}
                />
            </label>
            <label
                onClick={handleColorPicker}
                className='form-item'
            >
                <p>Цвет карты:</p>
                <div className='color-picker'>
                    <div
                        className='color'
                        style={{
                            backgroundColor: isColorPickerActive
                                ? loyaltyParams.cardColorTemp
                                : loyaltyParams.cardColorActual
                        }}
                    />
                    <input
                        type='text'
                        name='cardColor'
                        value={loyaltyParams.cardColorActual}
                        onChange={handleInputChange}
                    />
                </div>
            </label>
            {isColorPickerActive && (
                <PhotoshopPicker
                    color={loyaltyParams.cardColorTemp}
                    onChange={handleCardColorChange}
                    onCancel={onColorPickerCanceled}
                    onAccept={onColorPickerAccepted}
                />
            )}
            <label className='form-item'>
                <p>Логотип для Google Pay:</p>
                <input
                    type='file'
                    name='googlePayLogoImage'
                    onChange={handleFileUpload}
                />
            </label>
            <label className='form-item'>
                <p>Центральное изображение для Google Pay:</p>
                <input
                    type='file'
                    name='googlePayHeroImage'
                    onChange={handleFileUpload}
                />
            </label>
            <button type='submit'>Создать карту лояльности</button>
        </form>
    )
}
