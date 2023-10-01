import { AppRouter } from '@/components/trpc'
import {createTRPCReact} from '@trpc/react-query'

export const trpc = createTRPCReact<AppRouter>({}) 