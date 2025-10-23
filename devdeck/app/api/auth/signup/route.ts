import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { addCorsHeaders, handleCorsPreFlight } from '@/lib/cors'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório'),
})

// Handle CORS preflight
export async function OPTIONS() {
  return handleCorsPreFlight()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      const response = NextResponse.json(
        { error: 'Este email já está em uso.' },
        { status: 409 }
      )
      return addCorsHeaders(response)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    const response = NextResponse.json(user, { status: 201 })
    return addCorsHeaders(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    console.error('Signup error:', error)
    const response = NextResponse.json(
      { error: 'Erro ao criar usuário.' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
