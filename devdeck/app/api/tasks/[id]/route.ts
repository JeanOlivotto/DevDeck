import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/api-auth'
import { z } from 'zod'

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'DOING', 'DONE']).optional(),
  boardId: z.number().optional(),
})

type Params = {
  params: Promise<{ id: string }>
}

// GET /api/tasks/[id] - Get a single task
export async function GET(request: NextRequest, { params }: Params) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const taskId = parseInt(id)

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        board: true,
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: `Tarefa com ID ${taskId} não encontrada.` },
        { status: 404 }
      )
    }

    if (task.board.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para acessar esta tarefa.' },
        { status: 403 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tarefa.' },
      { status: 500 }
    )
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const taskId = parseInt(id)

  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { board: true },
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: `Tarefa com ID ${taskId} não encontrada.` },
        { status: 404 }
      )
    }

    if (existingTask.board.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para atualizar esta tarefa.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = updateTaskSchema.parse(body)

    // If changing board, verify new board belongs to user
    if (data.boardId && data.boardId !== existingTask.boardId) {
      const newBoard = await prisma.board.findUnique({
        where: { id: data.boardId },
      })

      if (!newBoard || newBoard.userId !== user.userId) {
        return NextResponse.json(
          { error: 'Novo quadro não encontrado ou não pertence a você.' },
          { status: 403 }
        )
      }
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        board: true,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update task error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar tarefa.' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const taskId = parseInt(id)

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { board: true },
    })

    if (!task) {
      return NextResponse.json(
        { error: `Tarefa com ID ${taskId} não encontrada.` },
        { status: 404 }
      )
    }

    if (task.board.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir esta tarefa.' },
        { status: 403 }
      )
    }

    await prisma.task.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ message: 'Tarefa excluída com sucesso.' })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir tarefa.' },
      { status: 500 }
    )
  }
}
