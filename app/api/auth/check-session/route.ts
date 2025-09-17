import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getSession()

        return NextResponse.json({
            hasSession: !!session,
            user: session ? {
                userId: session.userId,
                email: session.email,
                name: session.name
            } : null
        })
    } catch(error) {
        console.error('Check session error:', error)
        return NextResponse.json(
            { hasSession: false, user: null },
            {status: 200}
        )
    }
}