import React, { createContext, useRef, useState } from 'react'
import { useToast } from '../ui/use-toast'
import { useMutation } from '@tanstack/react-query'
import { trpc } from '@/app/_trpc/client'
import { INFINITE_QUERY_LIMIT } from '@/config/infinity-query'
import { util } from 'zod'

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
  const backUpMsg = useRef('')
  const utils = trpc.useContext()
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({ fileId, message }),
      })
      if (!response.ok) {
        throw new Error('Something wrong in sending message.')
      }
      return response.body
    },
    onMutate: async ({ message }) => {
      backUpMsg.current = message
      setMessage('')
      await utils.getFileMessages.cancel()
      const prevMsg = utils.getFileMessages.getInfiniteData()
      // {fileId}

      // this code below moves all the old pages up and put the new message bellow
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) {
            return { pages: [], pageParams: [] }
          }

          let newPages = [...old.pages]
          let latestPage = newPages[0]!
          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ]
          newPages[0] = latestPage
          return {
            ...old,
            pages: newPages,
          }
        }
      )
      setIsLoading(true)
      return {
        previousMessages: prevMsg?.pages.flatMap((page) => page.messages) ?? [],
      }
    },
    onSuccess: async (stream) => {
      setIsLoading(false)

      if (!stream) {
        return toast({
          title: 'There was a problem sending this message',
          description: 'Please refresh this page and try again',
          variant: 'destructive',
        })
      }

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let done = false

      // accumulated response
      let accResponse = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)

        accResponse += chunkValue

        // append chunk to the actual message
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          (old) => {
            if (!old) return { pages: [], pageParams: [] }

            let isAiResponseCreated = old.pages.some((page) =>
              page.messages.some((message) => message.id === 'ai-response')
            )

            let updatedPages = old.pages.map((page) => {
              if (page === old.pages[0]) {
                let updatedMessages

                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: 'ai-response',
                      text: accResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ]
                } else {
                  updatedMessages = page.messages.map((message) => {
                    if (message.id === 'ai-response') {
                      return {
                        ...message,
                        text: accResponse,
                      }
                    }
                    return message
                  })
                }

                return {
                  ...page,
                  messages: updatedMessages,
                }
              }

              return page
            })

            return { ...old, pages: updatedPages }
          }
        )
      }
    },

    onError: (_, __, context) => {
      setMessage(backUpMsg.current)
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      )
    },
    onSettled: async () => {
      setIsLoading(false)

      await utils.getFileMessages.invalidate({ fileId })
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
