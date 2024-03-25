import { FC } from 'react'

const DropdownMenuItem: FC<{ items: string[] }> = ({ items }) => {
    return (
        <>
            <ul>
                {items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
            </ul>
            <ul>
                <li>О магазине</li>
                <li>Товары в кредит</li>
                <li>Trade-in</li>
                <li>Гарантия</li>
                <li>Доставка и оплата</li>
            </ul>
            <div>
                <h3>Связь с нами</h3>
                <div>
                    <button>О!</button>
                    <button>Beeline</button>
                    <button>Mega</button>
                </div>
                <button className='p-3 bg-gray-400'>Whatsapp</button>
            </div>
        </>
    )
}

export default DropdownMenuItem
