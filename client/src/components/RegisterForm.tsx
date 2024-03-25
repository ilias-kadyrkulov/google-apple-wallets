import { useToday } from '@/hooks/useToday'
import { TForm } from '@/lib/types'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import addToGoogleWallet from '@/assets/imgs/addToGoogleWallet.png'

export const RegisterForm = () => {
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors }
    } = useForm<TForm>()

    const createLoyaltyObject = async ({ name, email, dateOfBirth }: TForm) => {
        try {
            const res = await axios.post(
                'http://localhost:5000/loyalty/create-jwt-object',
                {
                    name: name,
                    email: email,
                    dateOfBirth: dateOfBirth
                }
            )

            console.log('Создана карта лояльности:', res.data)
            window.open(res.data, '_blank')
        } catch (error) {
            alert(error)
        }
    }

    const currentDate = useToday()

    return (
        <form
            className='flex flex-col items-center gap-6 bg-slate-600 rounded-lg p-5 w-2/4'
            onSubmit={handleSubmit(createLoyaltyObject)}
        >
            <label htmlFor='name'>
                <span className='text-slate-100'>Имя:</span>
                <input
                    type='text'
                    id='name'
                    {...register('name')}
                    className='rounded-lg ml-2 p-1'
                />
            </label>
            <label htmlFor='email'>
                <span className='text-slate-100'>E-mail:</span>
                <input
                    type='text'
                    id='email'
                    {...register('email', {
                        required: true,
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address.'
                        }
                    })}
                    className='rounded-lg ml-2 p-1 w-60'
                    required
                />
            </label>
            {errors.email?.message && <h2>{errors.email?.message}</h2>}
            <label htmlFor='dateOfBirth'>
                <span className='text-slate-100'>Дата рождения:</span>
                <input
                    type='date'
                    id='dateOfBirth'
                    {...register('dateOfBirth')}
                    min='1923-01-01'
                    max={currentDate}
                    className='rounded-lg ml-2 p-1'
                />
            </label>
            <button
                type='submit'
                className='min-h-12 flex flex-col items-center'
            >
                <img
                    src={addToGoogleWallet}
                    alt='Add to Google Wallet'
                />
            </button>
        </form>
    )
}
