import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'

interface WrapperProps {
  children: ReactNode
  className?: string
}

//wrapper component
const Wrapper = ({ children, className }: WrapperProps) => {
  return (
    <div className={cn(`w-full mx-auto max-w-screen-xl px-2.5 md:px-20`,className)}>
      {children}

    </div>
  )
}

export default Wrapper
