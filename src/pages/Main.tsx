import { useEffect, useState } from 'react';
import { onChange, getCountSync } from '../lib/counterData';
import { onChangePage } from '../lib/changePage';
import { getKindSync } from '../lib/changePage';
import Monitor from './Monitor';
import Bonus from './Bonus';
import gomen from '/gomen.png';
import drink from '/drink.png';


export default function Test() {
    const [count, setCount] = useState(getCountSync());
    const [kind, setKinds] = useState(getKindSync());

    useEffect(() => {
        const unsubscribe = onChange(setCount);
        // eslint-disable-next-line no-unused-vars
        const unsubscribePage = onChangePage(setKinds);
        return () => { unsubscribe(); unsubscribePage(); };
    }, []);

    return (
        <>
            {
                (kind === 0) ?
                    (count >= 1000) ?
                        <Bonus />
                        :
                        <Monitor />
                    :
                    <div className='font-noto h-full flex flex-col items-center justify-center relative'>
                        {(kind === 1) ?
                            <img src={gomen} alt="" className='h-full w-full' />
                            :
                            <img src={drink} alt="" className='h-full w-full' />
                        }
                    </div>
            }
        </>

    );
}