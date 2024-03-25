import { useState } from 'react'
import DropdownMenuItem from './DropdownMenuItem'
import { iPhoneItems, macItems, navLinks } from '@/lib/data'
import { TCategory } from '@/lib/types'
import clsx from 'clsx'

export default function DropdownMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [category, setCategory] = useState<null | TCategory>(null)

    const handleNavItemOnChange = (text: TCategory) => {
        setIsOpen(false)
        setCategory(text)
        setTimeout(() => {
            setIsOpen(true)
        }, 100)
    }

    return (
        <nav>
            <ul className='flex gap-2'>
                {navLinks.map((link, idx) => (
                    <li
                        key={idx}
                        onMouseEnter={() => {}}
                        onMouseOver={() => handleNavItemOnChange(link.text)}
                    >
                        {link.text}
                    </li>
                ))}
                <div
                    className={clsx(
                        'grid grid-cols-[0.5fr_1fr_0.5fr] gap-10 absolute left-2/4 -z-10 -translate-x-2/4 opacity-0 transition-all ease-in-out',
                        {
                            'z-10 translate-y-10 opacity-100 transition-all ease-in-out':
                                isOpen
                        }
                    )}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    {category === 'Mac' && (
                        <DropdownMenuItem items={macItems} />
                    )}
                    {category === 'iPhone' && (
                        <DropdownMenuItem items={iPhoneItems} />
                    )}
                </div>
            </ul>
        </nav>
    )
}
