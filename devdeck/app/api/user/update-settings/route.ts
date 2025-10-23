import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/api-auth'
import { z } from 'zod'

const updateSettingsSchema = z.object({
  notifyDailySummary: z.boolean().optional(),
  notifyStaleTasks: z.boolean().optional(),
  notifyViaWhatsApp: z.boolean().optional(),
  whatsappNumber: z.string().optional(),
})

// PATCH /api/user/update-settings - Update user settings
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  try {
    const body = await request.json()
    const data = updateSettingsSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        notifyDailySummary: true,
        notifyStaleTasks: true,
        notifyViaWhatsApp: true,
        whatsappNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update user settings error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações.' },
      { status: 500 }
    )
  }
}
