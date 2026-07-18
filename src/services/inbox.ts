import { api } from '@/lib/api-client'
import type {
  InboxConversationDetailResponse,
  InboxConversationsResponse,
} from '@/types/inbox'

export const inboxService = {
  listConversations(params?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    return api.get<InboxConversationsResponse>('/v1/inbox/conversations', {
      params,
    })
  },

  getConversation(id: string) {
    return api.get<InboxConversationDetailResponse>(
      `/v1/inbox/conversations/${id}`,
    )
  },
}
