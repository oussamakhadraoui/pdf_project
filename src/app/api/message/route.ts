import { sendMessageValidator } from '@/components/utils/Validators'
import { db } from '@/db'
import { getPineconeClient } from '@/lib/picone'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { NextRequest } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { openai } from '@/lib/OpenAi'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { getUser } = getKindeServerSession()
    console.log(body)
    const user = getUser()
    if (!user || !user.id) {
      return new Response('Unauthorized', {
        status: 401,
      })
    }
    const { fileId, message } = sendMessageValidator.parse(body)
    if (!fileId) {
      return new Response('fileId is required', {
        status: 400,
      })
    }
    const file = await db.file.findFirst({
      where: { id: fileId, userId: user.id },
    })
    if (!file) {
      return new Response('file not found', {
        status: 404,
      })
    }
    await db.message.create({
      data: {
        fileId,
        isUserMessage: true,
        userId: user.id,
        text: message,
      },
    })
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    const pinecone = await getPineconeClient()
    const pineconeIndex = pinecone.Index('gara')
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
    })
    const results = await vectorStore.similaritySearch(message, 4)
    const prevMessages = await db.message.findMany({
      where: { fileId },
      orderBy: { createdAt: 'asc' },
      take: 6,
    })
    const formattedPrevMessages = prevMessages.map((msg) => ({
      role: msg.isUserMessage ? ('user' as const) : ('assistant' as const),
      content: msg.text,
    }))

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            'Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format.',
        },
        {
          role: 'user',
          content: `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
    if (message.role === 'user') return `User: ${message.content}\n`
    return `Assistant: ${message.content}\n`
  })}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join('\n\n')}
  
  USER INPUT: ${message}`,
        },
      ],
    })
    console.log(response)
    // @ts-ignore
    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        await db.message.create({
          data: {
            text: completion,
            isUserMessage: false,
            fileId,
            userId: user.id,
          },
        })
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
    }

    return new Response('Something went wrong', {
      status: 500,
    })
  }
}
