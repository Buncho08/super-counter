import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useCounter() {
  const { user } = useAuth()
  const [value, setValue] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // 初期値を取得
    const fetchCounter = async () => {
      const { data } = await supabase
        .from('counters')
        .select('value')
        .eq('user_id', user.id)
        .eq('name', 'default')
        .single()

      if (data) {
        setValue(data.value)
      } else {
        // レコードがなければ作成
        await supabase.from('counters').insert({
          user_id: user.id,
          name: 'default',
          value: 0,
        })
      }
      setLoading(false)
    }

    fetchCounter()

    // Realtimeでリアルタイム同期
    const channel = supabase
      .channel('counter')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'counters',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setValue(payload.new.value)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const increment = async () => {
    await supabase.rpc('increment_counter', { uid: user!.id })
  }

  const decrement = async () => {
    await supabase.rpc('decrement_counter', { uid: user!.id })
  }

  return { value, loading, increment, decrement }
}