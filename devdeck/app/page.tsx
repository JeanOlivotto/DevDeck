'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('devdeck_auth_token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return <Dashboard />
}
