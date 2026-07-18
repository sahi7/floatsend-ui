import { api } from '@/lib/api-client'
import type {
  InvitationView,
  MemberView,
  OkResponse,
  Organization,
} from '@/types/api'

export const organizationsService = {
  list() {
    return api.get<Organization[] | { organizations: Organization[] }>(
      '/v1/organizations',
    )
  },

  create(body: { name: string; slug?: string }) {
    return api.post<Organization>('/v1/organizations', body)
  },

  listMembers(orgId: string) {
    return api.get<MemberView[] | { members: MemberView[] }>(
      `/v1/organizations/${orgId}/members`,
    )
  },

  updateMemberRole(orgId: string, userId: string, role: string) {
    return api.patch<MemberView>(
      `/v1/organizations/${orgId}/members/${userId}/role`,
      { role },
    )
  },

  removeMember(orgId: string, userId: string) {
    return api.delete<OkResponse>(
      `/v1/organizations/${orgId}/members/${userId}`,
    )
  },

  leave(orgId: string) {
    return api.post<OkResponse>(`/v1/organizations/${orgId}/leave`)
  },

  transferOwnership(orgId: string, user_id: string) {
    return api.post<OkResponse>(
      `/v1/organizations/${orgId}/transfer-ownership`,
      { user_id },
    )
  },

  listInvitations(orgId: string) {
    return api.get<InvitationView[] | { invitations: InvitationView[] }>(
      `/v1/organizations/${orgId}/invitations`,
    )
  },

  createInvitation(orgId: string, body: { email: string; role: string }) {
    return api.post<InvitationView>(
      `/v1/organizations/${orgId}/invitations`,
      body,
    )
  },

  revokeInvitation(orgId: string, invitationId: string) {
    return api.delete<OkResponse>(
      `/v1/organizations/${orgId}/invitations/${invitationId}`,
    )
  },

  acceptInvitation(token: string) {
    return api.post<OkResponse>(`/v1/invitations/${token}/accept`)
  },

  declineInvitation(token: string) {
    return api.post<OkResponse>(`/v1/invitations/${token}/decline`)
  },
}
