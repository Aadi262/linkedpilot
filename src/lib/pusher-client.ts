'use client'

import PusherClient from 'pusher-js'

let _pusherClient: PusherClient | null = null

export function getPusherClient(): PusherClient | null {
  if (typeof window === 'undefined') return null
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return null

  if (!_pusherClient) {
    _pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST!,
      wsPort: parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT || '443'),
      forceTLS: true,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      cluster: 'mt1', // required by types; overridden by wsHost above
    })
  }
  return _pusherClient
}
