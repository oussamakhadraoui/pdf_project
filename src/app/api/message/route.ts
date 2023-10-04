import { sendMessageValidator } from '@/components/utils/Validators'
import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { getUser } = getKindeServerSession()

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
  } catch (error) {}
}
