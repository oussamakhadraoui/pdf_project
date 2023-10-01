import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { TRPCError, initTRPC } from '@trpc/server'

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create()
const middleware = t.middleware
const isAuth=middleware(async(option)=>{
 const {getUser}=getKindeServerSession()
 const user= getUser()
 if(!user||!user.id){
  throw new TRPCError({code:'UNAUTHORIZED'})
 }
 return option.next({ctx:{user:user,userId:user.id}})
})

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure=t.procedure.use(isAuth)
