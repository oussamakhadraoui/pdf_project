
import React from 'react'
import Messages from './Messsages'
import ChatInput from './ChatInput'

interface ChatWrapperProps {}

const ChatWrapper = ({}: ChatWrapperProps) => {
  return (
    <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
      <div className='flex-1 flex flex-col justify-between mb-28'>
        <Messages/>
      </div>
      <ChatInput/>
    </div>
  )
}

export default ChatWrapper
