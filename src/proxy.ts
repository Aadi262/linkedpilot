import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth disabled for local dev — re-enable by restoring Clerk middleware
export default function proxy(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
