'use client'

import * as React from 'react'

import { cn } from '@/server/utils/helpers'

const spinnerVariants =
  'w-16 h-16 border-4 border-t-4 border-muted border-t-primary rounded-full animate-spin'

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  text?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>((props, ref) => {
  const { className, text, ...rest } = props
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="flex flex-col items-center">
        <div ref={ref} className={cn(spinnerVariants, className)} {...rest} />
        <span className="mt-2 text-center text-foreground">{text}</span>
      </div>
    </div>
  )
})

LoadingSpinner.displayName = 'LoadingSpinner'

export { LoadingSpinner }
