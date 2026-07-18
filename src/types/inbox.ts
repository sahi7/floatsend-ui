export type ConversationStatus = 'open' | 'pending' | 'closed' | 'spam' | string
export type MessageDirection = 'outbound' | 'inbound' | 'internal' | string

export interface InboxConversation {
  id: string
  organization_id: string
  subject: string
  status: ConversationStatus
  channel?: string
  mailbox_address?: string
  last_message_at?: string
  message_count?: number
  assignee_user_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface InboxConversationsResponse {
  conversations: InboxConversation[]
  limit: number
  offset: number
}

export interface InboxMessage {
  id: string
  direction: MessageDirection
  from_address?: string
  to_addresses?: string[]
  subject?: string
  snippet?: string
  text_body?: string
  html_body?: string
  rfc_message_id?: string
  in_reply_to?: string
  references?: string
  has_attachments?: boolean
  created_at?: string
}

export interface InboxConversationDetailResponse {
  conversation: InboxConversation
  messages: InboxMessage[]
}
