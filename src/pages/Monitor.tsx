import { useEffect, useState } from 'react';
import { onChange, getCountSync } from '../lib/counterData';
import counter from "/counter.mp4";

export default function Monitor() {
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
          <source src={counter} type="video/mp4" />
        </video>
        <div className='absolute w-full bottom-[7rem] text-center mx-auto my-0'>
          <p style={{ WebkitTextStroke: "7px #000", paintOrder: "stroke" }} className='text-[250px] font-extrabold text-yellow-500'>
            {count}
          </p>
        </div>
      </div >
    </div>
  );
}