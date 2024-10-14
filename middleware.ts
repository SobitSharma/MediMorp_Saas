import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const PublicRoutes = createRouteMatcher([
    '/signin',
    '/signup',
    '/'
])

const PrivateApiRoutes = createRouteMatcher([
    '/share',
    '/transform',
    '/socialmediacenter',
    '/media',
    '/home',
    '/setting',
    "/api/upload",
    "/api/getuserdata",
    "/api/auth/savinguser",
    "/api/deletemedia/:id",
    "/api/transform",
    "/api/social"
])


export default clerkMiddleware((auth, req)=> {
    const {userId} = auth();
    if(userId){
        if(!PrivateApiRoutes(req)){
            return NextResponse.redirect(new URL('/home',req.url))
        }
    }
    if(!userId && PrivateApiRoutes(req)){
        return NextResponse.redirect(new URL('/signin',req.url))
    }
    return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}