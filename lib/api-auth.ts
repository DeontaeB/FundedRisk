import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getAuthenticatedUser(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return { user: null, error: 'Unauthorized' }
  }
  
  return { user: session.user, error: null }
}

export function createApiResponse(data: any, status = 200) {
  return Response.json(data, { status })
}

export function createErrorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}