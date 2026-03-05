import React from 'react';
import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router';
import Top from './pages/Top';
import Monitor from './pages/Monitor';
import Counter from './pages/Counter';
import Main from './pages/Main';
import Settings from './pages/Settings';
import { supabase } from './lib/supabase'

const router = createBrowserRouter([
  { path: '/', element: <Top /> },
  { path: '/monitor', element: <Monitor /> },
  { path: '/counter', element: <Counter /> },
  { path: '/main', element: <Main /> },
  { path: '/settings', element: <Settings /> },
]);


export default function App() {
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from('counters').select('*')
      console.log('data:', data)
      console.log('error:', error)
    }
    test()
  }, [])
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}