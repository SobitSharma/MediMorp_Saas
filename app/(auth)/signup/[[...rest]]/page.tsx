import React from 'react'
import { SignUp } from '@clerk/nextjs'

const signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
    <SignUp signInUrl='/signin'/>
  </div>
  )
}

export default signup