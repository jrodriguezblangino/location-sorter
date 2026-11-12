import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { controlClass } from './controls.ts'

type Variant = 'primary' | 'ghost' | 'dark'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

export function Button({ variant = 'primary', className = '', type = 'button', children, ...props }: Props) {
  return (
    <button type={type} className={controlClass(variant, className)} {...props}>
      {children}
    </button>
  )
}
