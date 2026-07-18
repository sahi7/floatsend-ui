import { api } from '@/lib/api-client'
import type {
  BillingInvoice,
  BillingInvoicesListResponse,
  BillingPlansResponse,
  BillingProfile,
  BillingProfileUpdate,
  BillingSubscription,
  BillingUsageResponse,
  ChangePlanRequest,
  GenerateInvoiceRequest,
} from '@/types/billing'

export const billingService = {
  listPlans() {
    return api.get<BillingPlansResponse>('/v1/billing/plans')
  },

  getSubscription() {
    return api.get<BillingSubscription>('/v1/billing/subscription')
  },

  changePlan(body: ChangePlanRequest) {
    return api.post<BillingSubscription>(
      '/v1/billing/subscription/change-plan',
      body,
    )
  },

  getUsage() {
    return api.get<BillingUsageResponse>('/v1/billing/usage')
  },

  getProfile() {
    return api.get<BillingProfile>('/v1/billing/profile')
  },

  updateProfile(body: BillingProfileUpdate) {
    return api.put<BillingProfile>('/v1/billing/profile', body)
  },

  listInvoices(params?: { limit?: number; offset?: number }) {
    return api.get<BillingInvoicesListResponse>('/v1/billing/invoices', {
      params,
    })
  },

  getInvoice(id: string) {
    return api.get<BillingInvoice>(`/v1/billing/invoices/${id}`)
  },

  generateInvoice(body?: GenerateInvoiceRequest) {
    return api.post<BillingInvoice>('/v1/billing/invoices/generate', body ?? {})
  },
}
