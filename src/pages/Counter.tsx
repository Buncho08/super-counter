import { useCounter } from '../contexts/CounterContext';
import DropDownMenu from '../components/dropDown';

export default function Counter() {
  const { value, loading, increment, decrement } = useCounter();

  if (loading) return <div className='font-noto h-full flex items-center justify-center'>読み込み中...</div>

  return (
    <div className='font-noto h-full flex flex-col items-center justify-center'>
      <div className='mb-10 flex flex-row'>
        <h1 className='text-6xl'>開花宣言</h1>
        <h2 className='text-6xl'>ドリンク枚数カウンター</h2>
      </div>
      <div className='my-8 flex flex-row items-end'>
        <p className='text-7xl'>只今...</p>
        <div className='text-9xl'>{value}</div>
        <p className='text-7xl'>杯</p>
      </div>
      <div className='flex flex-row gap-8'>
        <button
          onClick={increment}
          className="inline-block rounded-sm bg-amber-400 px-12 py-3 text-sm font-medium text-white transition hover:scale-110 hover:shadow-xl focus:ring-3 focus:outline-hidden"
        >
          増やす +1
        </button>
        <button
          onClick={decrement}
          className="inline-block rounded-sm border border-current px-12 py-3 text-sm font-medium text-amber-400 transition hover:scale-110 hover:shadow-xl focus:ring-3 focus:outline-hidden"
        >
          減らす -1
        </button>
      </div>
      <h3 className='mt-10 mb-5 text-4xl'>ページ切り替え</h3>
      <DropDownMenu />
    </div>
  );
}