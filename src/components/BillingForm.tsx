"use client"
import { getUserSubscriptionPlan } from '@/lib/stripe'
import React from 'react'
import { useToast } from './ui/use-toast'
import { trpc } from '@/app/_trpc/client'
import Wrapper from './Wrapper'
import { Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { format } from 'date-fns'

interface BillingFormProps {
  subscriptionPlan:Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const BillingForm = ({ subscriptionPlan }: BillingFormProps) => {
 const {toast}=useToast()
 const {mutate:createStripeSession,isLoading}= trpc.createStripeSession.useMutation({
  onSuccess({url}) {
   if(url) window.location.href= url
   if(!url) {
    toast({title:"Something went wrong!",type:"foreground",variant:'destructive',description:'please try again later.'})
   }
   
  },
 })
  return (
    <Wrapper className='max-w-5xl'>
      {' '}
      <form
        className='mt-12'
        onSubmit={(e) => {
          e.preventDefault()
          createStripeSession()
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the <strong>{subscriptionPlan.name}</strong>{' '}
              plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className='flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0'>
            <Button type='submit'>
              {isLoading ? (
                <Loader2 className='mr-4 h-4 w-4 animate-spin' />
              ) : null}
              {subscriptionPlan.isSubscribed
                ? 'Manage Subscription'
                : 'Upgrade to PRO'}
            </Button>

            {subscriptionPlan.isSubscribed ? (
              <p className='rounded-full text-xs font-medium'>
                {subscriptionPlan.isCanceled
                  ? 'Your plan will be canceled on '
                  : 'Your plan renews on'}
                {format(subscriptionPlan.stripeCurrentPeriodEnd!, 'dd.MM.yyyy')}
                .
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </Wrapper>
  )
}

export default BillingForm
