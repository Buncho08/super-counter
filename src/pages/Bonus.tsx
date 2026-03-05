import bonus from '/bonus.mp4';
import { useEffect, useState } from 'react';
import { onChange, getCountSync } from '../lib/counterData';

export default function Bonus() {
    const [count, setCount] = useState(getCountSync());

    useEffect(() => {
        const unsubscribe = onChange(setCount);
        return unsubscribe;
    }, []);
    return (
        <div className='flex justify-center items-center h-full bg-black'>
            <div className='font-noto h-[770px] w-[1220px] relative'>
                <video
                    autoPlay
                    loop
                    playsInline
                    muted
                    className='h-full w-full'
                >
                    <source src={bonus} type="video/mp4" />
                </video>
                <div className='absolute right-[18.3rem] top-[4rem] text-center my-0'>
                    {/* <div className='absolute w-[650px] left-[980px] top-[70px] text-center'> */}
                    <p className='text-[90px] font-extrabold text-black'>
                        {count}
                    </p>
                </div>
            </div >
        </div>
    )
}