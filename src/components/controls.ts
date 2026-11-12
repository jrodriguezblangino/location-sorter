type Variant = 'primary' | 'ghost' | 'dark'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-ink hover:bg-ember',
  ghost: 'bg-white text-ink ring-1 ring-line hover:bg-paper',
  dark: 'bg-ink text-white hover:bg-black',
}

export function controlClass(variant: Variant = 'primary', className = ''): string {
  return `inline-flex min-h-12 items-center justify-center rounded-full px-5 text-base font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`
}
