export interface BillingPlan {
  code: string
  name: string
  price_monthly_cents: number
  price_yearly_cents: number
  is_public: boolean
  entitlements?: Record<string, string | number | boolean>
}

export interface BillingPlansResponse {
  plans: BillingPlan[]
}

export interface BillingSubscription {
  id: string
  organization_id: string
  plan_code: string
  plan_name: string
  status: string
  price_monthly_cents: number
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export interface UsageBucket {
  key: string
  used: number
  limit: number
  remaining: number
  over_limit: boolean
}

export interface BillingCharges {
  currency: string
  plan_base_cents: number
  included_live_emails: number
  live_emails_used: number
  overage_emails: number
  overage_per_1000_cents: number
  overage_cents: number
  estimated_total_cents: number
  price_always_zero: boolean
  hard_capped: boolean
  overage_mode: string
}

export interface BillingUsageResponse {
  organization_id: string
  plan_code: string
  plan_name: string
  subscription_status: string
  period_start: string
  period_end: string
  price_monthly_cents: number
  usage: {
    live_monthly?: UsageBucket
    test_monthly?: UsageBucket
    live_daily?: UsageBucket
    test_daily?: UsageBucket
    [key: string]: UsageBucket | undefined
  }
  charges: BillingCharges
  entitlements?: Record<string, string | number | boolean>
}

export interface BillingProfile {
  organization_id: string
  billing_email: string
  full_name: string
  country_or_region: string
  address_line1: string
  tax_id: string
  created_at?: string
  updated_at?: string
}

export interface BillingProfileUpdate {
  billing_email: string
  full_name: string
  country_or_region: string
  address_line1: string
  tax_id: string
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_cents: number
  amount_cents: number
}

export interface BillingInvoice {
  id: string
  invoice_number: string
  status: string
  currency: string
  amount_cents: number
  period_start: string
  period_end: string
  plan_code?: string
  plan_name?: string
  billing_email?: string
  billing_full_name?: string
  billing_country_or_region?: string
  billing_address_line1?: string
  billing_tax_id?: string
  issued_at?: string
  created_at?: string
  notes?: string
  items?: InvoiceLineItem[]
}

export interface BillingInvoicesListResponse {
  invoices: BillingInvoice[]
  limit: number
  offset: number
}

export interface GenerateInvoiceRequest {
  period_start?: string
  period_end?: string
  force?: boolean
  notes?: string
}

export interface ChangePlanRequest {
  plan_code: string
  immediate?: boolean
}
