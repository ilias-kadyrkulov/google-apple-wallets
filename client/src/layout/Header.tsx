import { Link } from 'react-router-dom'
import { useLocation } from 'react-router'
import DropdownMenu from '@/components/DropdownMenu'
import { User } from 'lucide-react'
import logo from '@/assets/imgs/logomobile.png'

type Props = {}

export const Header = (props: Props) => {
    const { pathname } = useLocation()
    console.log(pathname)

    return (
        <header className='flex justify-between p-5'>
            {/* <Link to='/'>
                <img
                    src={logo}
                    alt='logo'
                />
            </Link> */}
            {/* <DropdownMenu /> */}
            {pathname === '/' && (
                <Link to='login'>
                    <button className='flex items-center gap-1 bg-[#f8f8f8] p-3 rounded-lg font-bold text-lg'>
                        <User />
                        <p>Войти</p>
                    </button>
                </Link>
            )}
        </header>
    )
}
