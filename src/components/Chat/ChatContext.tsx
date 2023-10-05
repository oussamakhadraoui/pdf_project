import React, { createContext, useState } from 'react'
import { useToast } from '../ui/use-toast'
import { useMutation } from '@tanstack/react-query'

interface ChatContextProps {
  addMessage: () => void
  message: string
  isLoading: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export const ChatContext = createContext<ChatContextProps>({
  addMessage: () => {},
  message: '',
  isLoading: false,
  handleInputChange: () => {},
})

interface chatContextProviderProps {
  children: React.ReactNode
  fileId: string
}
export const ChatContextProvider = ({
  children,
  fileId,
}: chatContextProviderProps) => {
  const [message, setMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { toast } = useToast()

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }:{message: string}) => {
      const response = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({ fileId, message }),
      })
      if (!response.ok) {
        throw new Error('Something wrong in sending message.')
      }
      return response.body
    },
  })
  const addMessage = () => {
    sendMessage({ message })
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }
  return (
    <ChatContext.Provider
      value={{ addMessage, message, isLoading, handleInputChange }}
    >
      {children}
    </ChatContext.Provider>
  )
}
