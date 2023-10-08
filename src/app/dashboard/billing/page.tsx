import BillingForm from '@/components/BillingForm'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import React from 'react'

interface pageProps {
  
}

const page = async({}: pageProps) => {
 const subscriptionPlan= await getUserSubscriptionPlan()
  return <BillingForm subscriptionPlan={subscriptionPlan}/>
}

export default page
