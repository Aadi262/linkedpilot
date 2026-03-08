import Pusher from 'pusher'

let _pusher: Pusher | null = null

export function getPusher(): Pusher {
  if (!_pusher) {
    _pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      host: process.env.PUSHER_HOST!,
      port: process.env.PUSHER_PORT || '443',
      useTLS: process.env.PUSHER_SCHEME !== 'http',
    })
  }
  return _pusher
}

export const PUSHER_EVENTS = {
  NEW_MESSAGE: 'new-message',
  CAMPAIGN_STATUS: 'campaign-status',
  ACCOUNT_STATUS: 'account-status',
} as const

export function workspaceChannel(workspaceId: string) {
  return `workspace-${workspaceId}`
}
