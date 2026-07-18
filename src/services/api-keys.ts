import { api } from '@/lib/api-client'
import type {
  ApiKeysListResponse,
  ApiKeyView,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  OkResponse,
  RotateApiKeyResponse,
} from '@/types/api'

export const apiKeysService = {
  list() {
    return api.get<ApiKeysListResponse>('/v1/api-keys')
  },

  get(id: string) {
    return api.get<ApiKeyView>(`/v1/api-keys/${id}`)
  },

  create(body: CreateApiKeyRequest) {
    return api.post<CreateApiKeyResponse>('/v1/api-keys', body)
  },

  update(id: string, body: { name?: string; scopes?: string[] }) {
    return api.patch<ApiKeyView>(`/v1/api-keys/${id}`, body)
  },

  revoke(id: string) {
    return api.delete<OkResponse>(`/v1/api-keys/${id}`)
  },

  rotate(id: string) {
    return api.post<RotateApiKeyResponse>(`/v1/api-keys/${id}/rotate`)
  },
}
