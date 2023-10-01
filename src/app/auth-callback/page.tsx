"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'


const CallBack = () => {
  const router = useRouter()
  const SearchParam = useSearchParams()
  const origin = SearchParam.get('origin')
  trpc.authCallBack.useQuery(undefined, {
    onSuccess({ message }) {
      if (message) {
        router.push(origin ? `/${origin}` : '/dashboard')
      }
    },
    onError(err) {
      if (err.data?.code === 'UNAUTHORIZED') {
        router.push('/sign-in')
      }
    },
    retry: true,
    retryDelay: 500,
  })
  return (
    <div className='w-full mt-24 flex justify-center'>
      <div className='flex flex-col items-center'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
        <h3 className='font-semibold text-xl'>Setting up your account...</h3>
        <p>You will be redirect automatically.</p>
      </div>
    </div>
  )
}

export default CallBack
