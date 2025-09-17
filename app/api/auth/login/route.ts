import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const { email, name } = await request.json()
        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email required' },
                { status: 404 },

            )
        }

        let user = await prisma.user.findUnique({
            where: { email},
        })
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                },
            })
        }

        //set Session

        await setSession(user.id, user.email, user.name);
        return NextResponse.json({user})
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Login failed' },
            {status: 500}
        )
    }
}