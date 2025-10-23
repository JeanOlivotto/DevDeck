import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import { addCorsHeaders, handleCorsPreFlight } from '@/lib/cors'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

// Handle CORS preflight
export async function OPTIONS() {
  return handleCorsPreFlight()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !(await comparePassword(password, user.password))) {
      const response = NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      )
      return addCorsHeaders(response)
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json(
      {
        access_token: token,
        user: userWithoutPassword,
      }
    )
    return addCorsHeaders(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    console.error('Login error:', error)
    const response = NextResponse.json(
      { error: 'Erro ao fazer login.' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
