import { NextRequest, NextResponse } from 'next/server'

export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export function handleCorsPreFlight() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Wrapper para adicionar CORS a rotas automaticamente
export async function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>,
  request: NextRequest
): Promise<NextResponse> {
  try {
    const response = await handler(request)
    return addCorsHeaders(response)
  } catch (error) {
    const response = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
