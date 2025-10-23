import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/api-auth'
import { z } from 'zod'

const updateBoardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
})

type Params = {
  params: Promise<{ id: string }>
}

// GET /api/boards/[id] - Get a single board
export async function GET(request: NextRequest, { params }: Params) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const boardId = parseInt(id)

  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!board) {
      return NextResponse.json(
        { error: `Quadro com ID ${boardId} não encontrado.` },
        { status: 404 }
      )
    }

    if (board.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para acessar este quadro.' },
        { status: 403 }
      )
    }

    return NextResponse.json(board)
  } catch (error) {
    console.error('Get board error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar quadro.' },
      { status: 500 }
    )
  }
}

// PATCH /api/boards/[id] - Update a board
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const boardId = parseInt(id)

  try {
    // Check if board exists and belongs to user
    const existingBoard = await prisma.board.findUnique({
      where: { id: boardId },
    })

    if (!existingBoard) {
      return NextResponse.json(
        { error: `Quadro com ID ${boardId} não encontrado.` },
        { status: 404 }
      )
    }

    if (existingBoard.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para atualizar este quadro.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name } = updateBoardSchema.parse(body)

    // Check for duplicate name
    const duplicate = await prisma.board.findUnique({
      where: {
        name_userId: {
          name,
          userId: user.userId,
        },
      },
    })

    if (duplicate && duplicate.id !== boardId) {
      return NextResponse.json(
        { error: `Você já possui um quadro com o nome '${name}'.` },
        { status: 409 }
      )
    }

    const board = await prisma.board.update({
      where: { id: boardId },
      data: { name },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json(board)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update board error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar quadro.' },
      { status: 500 }
    )
  }
}

// DELETE /api/boards/[id] - Delete a board
export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const boardId = parseInt(id)

  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    })

    if (!board) {
      return NextResponse.json(
        { error: `Quadro com ID ${boardId} não encontrado.` },
        { status: 404 }
      )
    }

    if (board.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este quadro.' },
        { status: 403 }
      )
    }

    await prisma.board.delete({
      where: { id: boardId },
    })

    return NextResponse.json({ message: 'Quadro excluído com sucesso.' })
  } catch (error) {
    console.error('Delete board error:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir quadro.' },
      { status: 500 }
    )
  }
}
