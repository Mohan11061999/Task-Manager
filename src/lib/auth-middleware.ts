import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '../lib/auth'

export function authenticateRequest(request: NextRequest) {
    const token = request.cookies.get('token')?.value

    if (!token) {
        return { error: new NextResponse('Unauthorized', { status: 401 }) }
    }

    const payload = verifyJwt(token)

    if (!payload) {
        return { error: NextResponse.redirect(new URL('/login', request.url)) }
    }

    return { user: payload }
}