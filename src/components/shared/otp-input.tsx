import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
  className?: string
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
  error,
  className,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(length, ' ').slice(0, length).split('')

  function updateAt(index: number, char: string) {
    const next = value.split('')
    while (next.length < length) next.push('')
    next[index] = char
    onChange(next.join('').replace(/\s/g, '').slice(0, length))
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    if (!digit) {
      updateAt(index, '')
      return
    }
    updateAt(index, digit)
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (!digits[index]?.trim() && index > 0) {
        inputsRef.current[index - 1]?.focus()
        updateAt(index - 1, '')
      } else {
        updateAt(index, '')
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length)
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, length - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  return (
    <div
      className={cn('flex justify-center gap-2', className)}
      role="group"
      aria-label="One-time password"
    >
      {Array.from({ length }).map((_, i) => (
        <Input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digits[i]?.trim() || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          error={error}
          className="h-12 w-10 px-0 text-center font-mono text-lg sm:w-11"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  )
}
