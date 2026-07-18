import { api } from '@/lib/api-client'
import type {
  DomainSettingsPatch,
  DomainsListResponse,
  DomainView,
  OkResponse,
  VerifyDnsResponse,
  VerifyOwnershipResponse,
  VerifySesResponse,
} from '@/types/api'

export const domainsService = {
  list() {
    return api.get<DomainsListResponse>('/v1/domains')
  },

  get(id: string) {
    return api.get<DomainView>(`/v1/domains/${id}`)
  },

  create(domain: string) {
    return api.post<DomainView>('/v1/domains', { domain })
  },

  verifyOwnership(id: string) {
    return api.post<VerifyOwnershipResponse>(
      `/v1/domains/${id}/verify-ownership`,
    )
  },

  verifyDns(id: string) {
    return api.post<VerifyDnsResponse>(`/v1/domains/${id}/verify`)
  },

  /** Poll SES identity until ses_status=verified */
  verifySes(id: string) {
    return api.post<VerifySesResponse>(`/v1/domains/${id}/verify-ses`)
  },

  updateSettings(id: string, body: DomainSettingsPatch) {
    return api.patch<DomainView>(`/v1/domains/${id}/settings`, body)
  },

  rotateDkim(id: string) {
    return api.post<DomainView>(`/v1/domains/${id}/dkim/rotate`)
  },

  remove(id: string) {
    return api.delete<OkResponse>(`/v1/domains/${id}`)
  },
}
