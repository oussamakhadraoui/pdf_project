
import { inferRouterOutputs } from '@trpc/server'
import {z} from 'zod'
import { AppRouter } from '../trpc'

export const sendMessageValidator = z.object({
 fileId:z.string(),
 message:z.string()
})

export type msgValidator = z.infer<typeof sendMessageValidator>


//mesage
type RouterOutput= inferRouterOutputs<AppRouter>

type Messages = RouterOutput['getFileMessages']['messages']

type OmitText = Omit<Messages[number],"text">

type ExtendedText ={
 text:string | JSX.Element
}

export type ExtendedMessage = OmitText & ExtendedText