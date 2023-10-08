import React from 'react'
import Wrapper from './Wrapper'
import Link from 'next/link'
import { buttonVariants } from './ui/button'
import { LoginLink, RegisterLink, getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { ArrowRight } from 'lucide-react'
import UserAccountNav from './UserAccountNav'
import MobileNav from './MobileNav'
interface NavbarProps {}

const Navbar = ({}: NavbarProps) => {

  const {getUser}= getKindeServerSession()
  const user = getUser()
  return (
    <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75  backdrop-blur-lg transition-all'>
      <Wrapper>
        <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
          <Link href='/' className='flex z-40 font-semibold'>
            <span>O.K</span>
          </Link>
          <MobileNav isAuth={!!user} />
          <div className='hidden items-center space-x-4 sm:flex'>
            {!user ? (
              <>
                <Link
                  href='/pricing'
                  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                >
                  Pricing
                </Link>
                <LoginLink
                  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                >
                  Sign in
                </LoginLink>
                <RegisterLink className={buttonVariants({ size: 'sm' })}>
                  Register <ArrowRight className='h-5 w-5 ml-1.5' />
                </RegisterLink>
              </>
            ) : (
              <>
                <Link
                  href='/dashboard'
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}
                >
                  Dashboard
                </Link>

                <UserAccountNav
                  name={
                    !user.given_name || !user.family_name
                      ? 'Your Account'
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ''}
                  imageUrl={user.picture ?? ''}
                />
              </>
            )}
          </div>
        </div>
      </Wrapper>
    </nav>
  )
}

export default Navbar
