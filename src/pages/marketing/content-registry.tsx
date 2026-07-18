import type { ContentPageProps } from '@/components/marketing/content-page'

/** Shared copy for marketing / legal / support pages — visual content only */
export const contentRegistry: Record<string, ContentPageProps> = {
  features: {
    eyebrow: 'Product',
    title: 'Everything you need to send email at scale',
    description:
      'Domains, API keys, webhooks, delivery visibility, and a developer console — designed as infrastructure, not a marketing tool.',
    sections: [
      {
        heading: 'Transactional by design',
        body: [
          'FloatSend is built for password resets, receipts, OTP codes, and product notifications. Latency, reliability, and observability come first.',
        ],
        bullets: [
          'REST API with API-key authentication',
          'Domain ownership and SES-backed From identity',
          'Signed webhooks for lifecycle events',
          'Activity logs with filters and search',
        ],
      },
      {
        heading: 'Control plane for operators',
        body: [
          'Workspace-scoped JWT for the dashboard. Machine keys for send. Clear separation between human operators and production traffic.',
        ],
      },
    ],
  },
  pricing: {
    eyebrow: 'Pricing',
    title: 'Transactional email plans',
    description:
      'Plans are based on emails sent and received each month. Multiple To, CC, or BCC recipients count as separate emails.',
    sections: [
      {
        heading: 'Free — $0/mo',
        body: [
          '3,000 emails per month. Limited to 100 emails per day. Overage is not available; sending hard-blocks at the cap so charges stay $0.',
        ],
        bullets: [
          '3,000 emails / month',
          '100 emails / day hard cap',
          'Overage not available',
        ],
      },
      {
        heading: 'Pro',
        body: [
          'No daily sending limit. Overage is $0.90 per 1,000 emails beyond included monthly volume.',
        ],
        bullets: [
          '$20/mo — 50,000 emails / month · $0.90 overage per 1k',
          '$35/mo — 100,000 emails / month · $0.90 overage per 1k',
        ],
      },
      {
        heading: 'Scale',
        body: [
          'Higher included volume with lower overage rates as you grow. No daily sending limit; overage applies only beyond the included monthly volume.',
        ],
        bullets: [
          '$90/mo — 100,000 emails · $0.90 / 1k overage',
          '$160/mo — 200,000 emails · $0.80 / 1k overage',
          '$350/mo — 500,000 emails · $0.70 / 1k overage',
          '$650/mo — 1,000,000 emails · $0.65 / 1k overage',
          '$825/mo — 1,500,000 emails · $0.52 / 1k overage',
          '$1,150/mo — 2,500,000 emails · $0.46 / 1k overage',
        ],
      },
      {
        heading: 'Enterprise — Custom',
        body: [
          'For teams sending 3 million or more emails per month. Custom volume, pricing, and commercial terms.',
        ],
        bullets: [
          'Volume-based pricing',
          'Priority support',
          'SLA guarantees',
          'Flexible data retention',
          'SSO',
        ],
      },
    ],
    ctaLabel: 'Start free',
    secondaryLabel: 'Contact sales',
    secondaryTo: '/contact',
  },
  enterprise: {
    eyebrow: 'Enterprise',
    title: 'Email infrastructure for serious teams',
    description:
      'Custom plans for teams sending 3 million or more emails per month — volume-based pricing, priority support, SLA guarantees, flexible data retention, and SSO.',
    sections: [
      {
        heading: 'What Enterprise includes',
        body: [
          'Beyond Scale volume tiers (up to 2.5M emails/mo on self-serve plans), Enterprise is built for organizations that need custom commercial and operational terms.',
        ],
        bullets: [
          'Volume-based pricing',
          'Priority support',
          'SLA guarantees',
          'Flexible data retention',
          'SSO',
        ],
      },
      {
        heading: 'Built for engineering orgs',
        body: [
          'SSO-ready authentication flows, role-based workspace access, session controls, and audit-friendly activity history.',
        ],
      },
      {
        heading: 'Operations partnership',
        body: [
          'Work with FloatSend ops for provider capacity, deliverability guidance, and platform-level SES identity management.',
        ],
      },
    ],
    ctaLabel: 'Contact sales',
    ctaTo: '/contact',
  },
  security: {
    eyebrow: 'Security',
    title: 'Security is a product requirement',
    description:
      'Defense in depth across authentication, secrets, and delivery identity — designed for teams that ship production systems.',
    sections: [
      {
        heading: 'Access control',
        body: [
          'JWT workspace sessions for the dashboard, short-lived tokens, refresh rotation, MFA enrollment, and session revocation.',
        ],
      },
      {
        heading: 'Secrets hygiene',
        body: [
          'API keys and webhook secrets are shown once. Production From requires verified domain ownership and SES identity — never expose platform AWS credentials to tenants.',
        ],
      },
    ],
  },
  reliability: {
    eyebrow: 'Reliability',
    title: 'Delivery you can reason about',
    description:
      'Accepted is not delivered. FloatSend surfaces queues, attempts, and status so your systems can react with confidence.',
    sections: [
      {
        heading: 'Async by default',
        body: [
          'Send returns 202 with a message id. Poll status or subscribe to webhooks for provider_accepted, failed, bounced, and more.',
        ],
      },
    ],
  },
  deliverability: {
    eyebrow: 'Deliverability',
    title: 'Inbox placement starts with identity',
    description:
      'Ownership proof and SES Easy DKIM give each From domain a verified sending identity in the right region.',
    sections: [
      {
        heading: 'Domain gate',
        body: [
          'Publish ownership TXT, then SES Easy DKIM CNAMEs. When ses_status is verified, can_send unlocks production From addresses.',
        ],
      },
    ],
  },
  developers: {
    eyebrow: 'Developers',
    title: 'An API that feels like infrastructure',
    description:
      'Predictable endpoints, strict routing, machine-readable errors, and a dashboard that mirrors how you already ship software.',
    sections: [
      {
        heading: 'DX principles',
        body: [
          'No trailing-slash surprises. Clear error codes. Idempotency keys on send. Webhook signatures with timestamp replay protection.',
        ],
        bullets: [
          'OpenAPI-aligned contracts',
          'cURL and SDK-friendly examples',
          'Activity filters for debugging',
        ],
      },
    ],
    ctaLabel: 'Read the docs',
    ctaTo: '/docs',
    secondaryLabel: 'API overview',
    secondaryTo: '/api',
  },
  solutions: {
    eyebrow: 'Solutions',
    title: 'Solutions for product and platform teams',
    description:
      'Whether you power auth emails or multi-tenant SaaS notifications, FloatSend fits as a controlled subsystem.',
    sections: [
      {
        heading: 'Authentication mail',
        body: [
          'OTP, verification, and password resets with predictable latency and clear failure paths.',
        ],
      },
      {
        heading: 'Multi-tenant SaaS',
        body: [
          'Per-workspace API keys, domain verification, and org-scoped logs keep customer data isolated.',
        ],
      },
    ],
  },
  'use-cases': {
    eyebrow: 'Use cases',
    title: 'Built for high-intent messages',
    description:
      'Passwordless login codes, receipts, shipping updates, and security alerts — not newsletters.',
    sections: [
      {
        heading: 'Where FloatSend shines',
        body: [
          'Transactional volume with observability. Soft and hard quota models. Webhooks that integrate with your workers.',
        ],
      },
    ],
  },
  customers: {
    eyebrow: 'Customers',
    title: 'Teams that treat email as infrastructure',
    description:
      'Engineering orgs choose FloatSend when deliverability, API clarity, and operational control matter more than drag-and-drop campaigns.',
    sections: [
      {
        heading: 'Success patterns',
        body: [
          'Teams ship faster when verify → domain → key → first send is a single coherent journey, with usage visible in billing.',
        ],
      },
    ],
  },
  integrations: {
    eyebrow: 'Integrations',
    title: 'Fits your stack',
    description:
      'HTTP-first design works with any language. Pair with your queue, observability, and auth systems.',
    sections: [
      {
        heading: 'Integration surface',
        body: [
          'REST send API, signed webhooks, dashboard control plane. No proprietary SDKs required to get started.',
        ],
      },
    ],
  },
  api: {
    eyebrow: 'API',
    title: 'Email API overview',
    description:
      'Authenticate with API keys for send and status. Use JWT for domains, keys, webhooks, billing, and team management.',
    sections: [
      {
        heading: 'Two auth worlds',
        body: [
          'Dashboard JWT is workspace-scoped. Machine keys send mail. Never mix them — the product enforces the boundary.',
        ],
      },
    ],
    ctaLabel: 'Open docs',
    ctaTo: '/docs',
  },
  docs: {
    eyebrow: 'Documentation',
    title: 'Documentation',
    description:
      'Guides for signup, domains, sending, webhooks, and billing. Start with the quickstart, then deepen into delivery semantics.',
    sections: [
      {
        heading: 'Start here',
        body: [
          'Create an account, verify email, add a domain (ownership + SES DKIM), create an API key, and send a test message.',
        ],
      },
    ],
  },
  changelog: {
    eyebrow: 'Changelog',
    title: 'Product changelog',
    description:
      'Notable platform improvements across delivery, domains, billing, and developer experience.',
    sections: [
      {
        heading: 'Recent',
        body: [
          'SES-only domain gate for production From, billing usage and on-demand invoices, OTP login, and activity filters for email logs.',
        ],
      },
    ],
  },
  status: {
    eyebrow: 'Status',
    title: 'System status',
    description:
      'Operational visibility for the FloatSend control plane and delivery pipeline. For live incidents, check this page and subscribe via your status channel.',
    sections: [
      {
        heading: 'Components',
        body: [
          'API, Dashboard, Email pipeline, Webhooks, and Authentication are monitored continuously. Historical uptime and incident postmortems are published as needed.',
        ],
        bullets: ['API — Operational', 'Dashboard — Operational', 'Pipeline — Operational'],
      },
    ],
    ctaLabel: 'Contact support',
    ctaTo: '/contact',
    secondaryLabel: 'Help center',
    secondaryTo: '/help',
  },
  roadmap: {
    eyebrow: 'Roadmap',
    title: 'Roadmap',
    description:
      'A transparent look at what we are investing in next — always subject to change based on customer needs.',
    sections: [
      {
        heading: 'Near term',
        body: [
          'Richer analytics, export tooling, and expanded SDK samples. Enterprise self-serve options remain sales-led.',
        ],
      },
    ],
  },
  templates: {
    eyebrow: 'Templates',
    title: 'Email templates',
    description:
      'Start from clean transactional patterns for OTP, receipts, and security notices. Customize in your application layer.',
    sections: [
      {
        heading: 'Approach',
        body: [
          'FloatSend focuses on reliable delivery of the HTML and text you provide. Keep templates versioned in your codebase for reviewability.',
        ],
      },
    ],
  },
  'email-api': {
    eyebrow: 'Email API',
    title: 'Send with a single request',
    description:
      'POST /v1/emails/send with an API key. Receive 202 accepted, then track delivery with status poll or webhooks.',
    sections: [
      {
        heading: 'Contract',
        body: [
          'From, to, subject, and body fields with optional idempotency. Production From requires can_send domains; test modes support owner and platform shared From.',
        ],
      },
    ],
  },
  'webhooks-docs': {
    eyebrow: 'Webhooks',
    title: 'Signed lifecycle events',
    description:
      'Configure HTTPS endpoints in the dashboard. Verify HMAC signatures, handle retries, and keep your app in sync with delivery state.',
    sections: [
      {
        heading: 'Events',
        body: [
          'Subscribe to accepted, queued, provider_accepted, failed, bounced, complained, delivered, and more. Secrets are shown once.',
        ],
      },
    ],
  },
  sdks: {
    eyebrow: 'SDKs',
    title: 'SDKs & client libraries',
    description:
      'Use any HTTP client today. First-party SDK samples grow with community demand — the API remains the source of truth.',
    sections: [
      {
        heading: 'Getting started',
        body: [
          'Authenticate with fs_live_ keys for send. Use dashboard JWT only for control-plane resources.',
        ],
      },
    ],
  },
  careers: {
    eyebrow: 'Careers',
    title: 'Build email infrastructure',
    description:
      'We are a distributed team between Cameroon and the United States, focused on reliability and developer experience.',
    sections: [
      {
        heading: 'How we work',
        body: [
          'Small teams, high ownership, and a bias toward shipping durable systems. Open roles are listed as they become available.',
        ],
      },
    ],
    ctaLabel: 'Contact us',
    ctaTo: '/contact',
  },
  company: {
    eyebrow: 'Company',
    title: 'About FloatSend',
    description:
      'FloatSend builds transactional email infrastructure for teams that need control, clarity, and deliverability without marketing platform noise.',
    sections: [
      {
        heading: 'Where we operate',
        body: [
          'We maintain presence in Douala, Cameroon and Delaware, United States — engineering and commercial coverage across time zones.',
        ],
      },
      {
        heading: 'What we believe',
        body: [
          'APIs should be boring in the best way: predictable, documented, and respectful of operator time.',
        ],
      },
    ],
  },
  leadership: {
    eyebrow: 'Leadership',
    title: 'Leadership',
    description:
      'A lean leadership group spanning product, engineering, and operations across our Cameroon and US presence.',
    sections: [
      {
        heading: 'Operating model',
        body: [
          'Decisions prioritize long-term reliability and customer trust. Security and deliverability reviews are part of the product process.',
        ],
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Contact FloatSend',
    description:
      'Sales, support, and general inquiries. We respond from our teams in Douala, Cameroon and Delaware, United States.',
    sections: [
      {
        heading: 'Reach us',
        body: [
          'For product support, use the help center first. For enterprise and security questionnaires, email sales or security as appropriate.',
        ],
        bullets: [
          'Support: help center & in-app channels',
          'Sales: enterprise and volume',
          'Security: responsible disclosure',
        ],
      },
      {
        heading: 'Offices',
        body: ['Douala, Cameroon', 'Delaware, United States'],
      },
    ],
    ctaLabel: 'Help center',
    ctaTo: '/help',
    secondaryLabel: 'Security policy',
    secondaryTo: '/legal/security',
  },
  offices: {
    eyebrow: 'Offices',
    title: 'Offices',
    description: 'FloatSend operates with hubs in Africa and the United States.',
    sections: [
      {
        heading: 'Cameroon',
        body: ['Douala, Cameroon — engineering and operations presence.'],
      },
      {
        heading: 'United States',
        body: ['Delaware, United States — commercial and corporate presence.'],
      },
    ],
  },
  press: {
    eyebrow: 'Press',
    title: 'Press & media',
    description:
      'For media inquiries and brand assets, contact our communications team.',
    sections: [
      {
        heading: 'Resources',
        body: [
          'Brand marks and product descriptions are available on the brand assets page. Please do not alter logo geometry.',
        ],
      },
    ],
    secondaryLabel: 'Brand assets',
    secondaryTo: '/brand',
  },
  brand: {
    eyebrow: 'Brand',
    title: 'Brand assets',
    description:
      'Use FloatSend marks with clear space and on approved backgrounds. Prefer monochrome treatments on dark infrastructure surfaces.',
    sections: [
      {
        heading: 'Guidelines',
        body: [
          'Do not recreate the logo. Do not add gradients or effects. Contact press for high-resolution packages.',
        ],
      },
    ],
  },
  help: {
    eyebrow: 'Support',
    title: 'Help center',
    description:
      'Guides for domains, sending, webhooks, billing, and account security.',
    sections: [
      {
        heading: 'Popular topics',
        body: [
          'Verify domain ownership and SES DKIM, create API keys, configure webhooks, and understand free plan hard limits.',
        ],
      },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    description: 'Short answers to common product questions.',
    sections: [
      {
        heading: 'Is FloatSend a marketing email tool?',
        body: [
          'No. It is transactional infrastructure: API-first sending, domains, webhooks, and operational visibility.',
        ],
      },
      {
        heading: 'How does free plan pricing work?',
        body: [
          'Free is $0/mo with 3,000 emails per month and a 100 emails/day hard cap. Overage is not available — sending hard-blocks at the cap so charges stay $0 until the window resets or you upgrade.',
        ],
      },
      {
        heading: 'How do Pro and Scale overage work?',
        body: [
          'Paid plans have no daily sending limit. Overage rates apply only to emails beyond the included monthly volume (for example $0.90 per 1,000 on Pro). Each To, CC, or BCC recipient counts as a separate email.',
        ],
      },
      {
        heading: 'When should I choose Enterprise?',
        body: [
          'For teams sending 3 million or more emails per month, or who need volume-based custom pricing, priority support, SLA guarantees, flexible data retention, or SSO.',
        ],
      },
    ],
  },
  community: {
    eyebrow: 'Community',
    title: 'Community',
    description:
      'Share feedback, report issues, and learn from other engineering teams building on FloatSend.',
    sections: [
      {
        heading: 'Participate',
        body: [
          'Join discussions through official channels as they open. Security issues should use responsible disclosure, not public forums.',
        ],
      },
    ],
  },
  trust: {
    eyebrow: 'Trust',
    title: 'Trust center',
    description:
      'Security, compliance, and operational transparency in one place.',
    sections: [
      {
        heading: 'Topics',
        body: [
          'Review our security policy, GDPR overview, DPA, and compliance resources. Contact us for questionnaires.',
        ],
      },
    ],
  },
  compliance: {
    eyebrow: 'Compliance',
    title: 'Compliance',
    description:
      'We align product practices with modern privacy and security expectations for SaaS infrastructure.',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Data processing agreements, privacy policy, and security controls form the baseline. SOC materials are available under NDA where applicable.',
        ],
      },
    ],
  },
  soc: {
    eyebrow: 'Compliance',
    title: 'SOC information',
    description:
      'Request SOC-related materials through your enterprise contact. Public summaries are limited by auditor terms.',
    sections: [
      {
        heading: 'Requests',
        body: [
          'Enterprise customers can request reports as part of security review. Contact sales or security for process details.',
        ],
      },
    ],
  },
  'legal-privacy': {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    description:
      'How FloatSend collects, uses, and protects personal data when you use our services.',
    sections: [
      {
        heading: 'Summary',
        body: [
          'We process account data, usage telemetry, and message metadata required to operate transactional email. We do not sell personal data.',
        ],
      },
      {
        heading: 'Contact',
        body: [
          'Privacy inquiries can be directed through our contact channels. Offices: Douala, Cameroon and Delaware, United States.',
        ],
      },
    ],
    ctaLabel: 'Contact',
    ctaTo: '/contact',
  },
  'legal-terms': {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    description:
      'The agreement between you and FloatSend for use of the platform and APIs.',
    sections: [
      {
        heading: 'Acceptable use',
        body: [
          'Transactional email only as permitted. No unsolicited bulk marketing. Abuse may result in suspension per our Acceptable Use Policy.',
        ],
      },
    ],
  },
  'legal-cookies': {
    eyebrow: 'Legal',
    title: 'Cookie Policy',
    description:
      'We use essential cookies for authentication and preferences. Analytics, if enabled, are minimized and disclosed here.',
    sections: [
      {
        heading: 'Control',
        body: [
          'You can control non-essential cookies via browser settings. Essential cookies are required for the dashboard to function.',
        ],
      },
    ],
  },
  'legal-dpa': {
    eyebrow: 'Legal',
    title: 'Data Processing Agreement',
    description:
      'Controller–processor terms for customers who process personal data through FloatSend.',
    sections: [
      {
        heading: 'Availability',
        body: [
          'Enterprise customers can execute a DPA as part of onboarding. Contact sales for the current template.',
        ],
      },
    ],
  },
  'legal-security': {
    eyebrow: 'Legal',
    title: 'Security Policy',
    description:
      'High-level description of how we protect systems, credentials, and customer data.',
    sections: [
      {
        heading: 'Controls',
        body: [
          'Access control, encryption in transit, secret handling, monitoring, and operational procedures for incident response.',
        ],
      },
    ],
  },
  'legal-disclosure': {
    eyebrow: 'Legal',
    title: 'Responsible Disclosure',
    description:
      'We welcome good-faith security research. Report vulnerabilities privately and allow reasonable time for remediation.',
    sections: [
      {
        heading: 'How to report',
        body: [
          'Contact security through the contact page with technical detail and reproduction steps. Do not access customer data or disrupt service.',
        ],
      },
    ],
    ctaLabel: 'Contact',
    ctaTo: '/contact',
  },
  'legal-aup': {
    eyebrow: 'Legal',
    title: 'Acceptable Use Policy',
    description:
      'Rules that keep the platform healthy for all customers.',
    sections: [
      {
        heading: 'Prohibited',
        body: [
          'Spam, phishing, malware distribution, and other abusive sending patterns are forbidden and may result in immediate suspension.',
        ],
      },
    ],
  },
  'legal-gdpr': {
    eyebrow: 'Legal',
    title: 'GDPR overview',
    description:
      'Information for customers assessing FloatSend under GDPR roles and obligations.',
    sections: [
      {
        heading: 'Roles',
        body: [
          'Customers typically act as controllers of recipient data. FloatSend processes message data to provide the service under a DPA where applicable.',
        ],
      },
    ],
  },
}
