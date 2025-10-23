import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/api-auth'

// GET /api/user/settings - Get current user settings
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        notifyDailySummary: true,
        notifyStaleTasks: true,
        notifyViaWhatsApp: true,
        whatsappNumber: true,
        whatsappSession: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      )
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Get user settings error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações.' },
      { status: 500 }
    )
  }
}
