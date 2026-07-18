import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { copyToClipboard, cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
  variant?: 'ghost' | 'outline' | 'secondary'
  size?: 'sm' | 'icon' | 'default'
}

export function CopyButton({
  value,
  label = 'Copy',
  className,
  variant = 'ghost',
  size = 'sm',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await copyToClipboard(value)
      setCopied(true)
      toast.success('Copied to clipboard')
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleCopy}
      aria-label={label}
    >
      {copied ? <Check className="size-3.5 text-[var(--success)]" /> : <Copy className="size-3.5" />}
      {size !== 'icon' && <span>{copied ? 'Copied' : label}</span>}
    </Button>
  )
}
