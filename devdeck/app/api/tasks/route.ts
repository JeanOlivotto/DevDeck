import { addCorsHeaders, handleCorsPreFlight } from '@/lib/cors'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/api-auth'
import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'DOING', 'DONE']).default('TODO'),
  boardId: z.number(),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'DOING', 'DONE']).optional(),
  boardId: z.number().optional(),
})

// GET /api/tasks - List all tasks for authenticated user
export async function OPTIONS() {
  return handleCorsPreFlight()
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const { searchParams } = new URL(request.url)
  const boardIdParam = searchParams.get('boardId')

  try {
    const where: any = {
      board: {
        userId: user.userId,
      },
    }

    if (boardIdParam) {
      const boardId = parseInt(boardIdParam)
      
      // Verify board belongs to user
      const board = await prisma.board.findUnique({
        where: { id: boardId },
      })

      if (!board || board.userId !== user.userId) {
        return NextResponse.json(
          { error: 'Quadro não encontrado.' },
          { status: 404 }
        )
      }

      where.boardId = boardId
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        board: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tarefas.' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  try {
    const body = await request.json()
    const data = createTaskSchema.parse(body)

    // Verify board exists and belongs to user
    const board = await prisma.board.findUnique({
      where: { id: data.boardId },
    })

    if (!board) {
      return NextResponse.json(
        { error: `Quadro com ID ${data.boardId} não encontrado.` },
        { status: 404 }
      )
    }

    if (board.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para adicionar tarefas a este quadro.' },
        { status: 403 }
      )
    }

    const task = await prisma.task.create({
      data,
      include: {
        board: true,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar tarefa.' },
      { status: 500 }
    )
  }
}
