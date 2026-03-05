import { useEffect, useState } from "react"
import { increment, decrement, onChange, getCountSync } from "../lib/counterData"

export default function Counter() {
    const [value, setValue] = useState(getCountSync())

    useEffect(() => {
        // counterData モジュールの onChange で Supabase Realtime の変更を受け取る
        const unsubscribe = onChange(setValue)
        return unsubscribe
    }, [])

    return (
        <div>
            <h1>{value}</h1>
            <button className="w-5 h-5 bg-green-600" onClick={increment}>+</button>
            <button className="w-5 h-5 bg-red-600" onClick={decrement}>-</button>
        </div>
    )
}