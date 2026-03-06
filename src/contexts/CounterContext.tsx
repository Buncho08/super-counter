import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

type CounterContextType = {
  value: number
  loading: boolean
  increment: () => Promise<void>
  decrement: () => Promise<void>
}

const CounterContext = createContext<CounterContextType>({} as CounterContextType)

export const CounterProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [value, setValue] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // DBから最新値を再取得するヘルパー
  const refetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('counters')
      .select('value')
      .eq('user_id', user.id)
      .eq('name', 'default')
      .single()
    if (data) setValue(data.value)
  }, [user])

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
        await supabase.from('counters').insert({
          user_id: user.id,
          name: 'default',
          value: 0,
        })
      }
      setLoading(false)
    }

    fetchCounter()

    // Realtimeでリアルタイム同期（アプリ全体で1つのサブスクリプション）
    const channel = supabase
      .channel(`counter-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'counters',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[Realtime] update received:', payload.new)
          setValue((payload.new as { value: number }).value)
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const increment = useCallback(async () => {
    if (!user) return
    setValue((prev) => prev + 1)
    const { error } = await supabase.rpc('increment_counter', { uid: user.id })
    if (error) {
      console.error('[Counter] increment error:', error)
      refetch()
    }
  }, [user, refetch])

  const decrement = useCallback(async () => {
    if (!user) return
    setValue((prev) => Math.max(prev - 1, 0))
    const { error } = await supabase.rpc('decrement_counter', { uid: user.id })
    if (error) {
      console.error('[Counter] decrement error:', error)
      refetch()
    }
  }, [user, refetch])

  return (
    <CounterContext.Provider value={{ value, loading, increment, decrement }}>
      {children}
    </CounterContext.Provider>
  )
}

export const useCounter = () => useContext(CounterContext)
