import {z} from 'zod'

export const sendMessageValidator = z.object({
 fileId:z.string(),
 message:z.string()
})

export type msgValidator = z.infer<typeof sendMessageValidator>
