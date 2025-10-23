import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/api-auth'
import { addCorsHeaders, handleCorsPreFlight } from '@/lib/cors'
import { z } from 'zod'

const createBoardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
})

// Handle CORS preflight
export async function OPTIONS() {
  return handleCorsPreFlight()
}

// GET /api/boards - List all boards for authenticated user
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return addCorsHeaders(unauthorizedResponse())

  try {
    const boards = await prisma.board.findMany({
      where: { userId: user.userId },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    })

    const response = NextResponse.json(boards)
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Get boards error:', error)
    const response = NextResponse.json(
      { error: 'Erro ao buscar quadros.' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

// POST /api/boards - Create a new board
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return addCorsHeaders(unauthorizedResponse())

  try {
    const body = await request.json()
    const { name } = createBoardSchema.parse(body)

    // Check if board with same name already exists for this user
    const existing = await prisma.board.findUnique({
      where: {
        name_userId: {
          name,
          userId: user.userId,
        },
      },
    })

    if (existing) {
      const response = NextResponse.json(
        { error: `Você já possui um quadro com o nome '${name}'.` },
        { status: 409 }
      )
      return addCorsHeaders(response)
    }

    const board = await prisma.board.create({
      data: {
        name,
        userId: user.userId,
      },
      include: {
        tasks: true,
      },
    })

    const response = NextResponse.json(board, { status: 201 })
    return addCorsHeaders(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    console.error('Create board error:', error)
    const response = NextResponse.json(
      { error: 'Erro ao criar quadro.' },
      { status: 500 }
    )
    return addCorsHeaders(response)
    return NextResponse.json(
      { error: 'Erro ao criar quadro.' },
      { status: 500 }
    )
  }
}
