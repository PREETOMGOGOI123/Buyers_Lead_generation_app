import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const hasSession = request.cookies.has('user-session')
    //Public routes
    if(pathname === '/login' || pathname === '/'){
        if (hasSession && pathname === '/login') {
            return NextResponse.redirect(new URL('/buyers', request.url))
        }
        return NextResponse.next()
    }
}