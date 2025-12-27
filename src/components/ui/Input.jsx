import { forwardRef } from 'react'
import Icon from './Icon'

const Input = forwardRef(({
  label,
  error,
  icon,
  required,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className={`text-sm font-medium text-gray-700 ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon name={icon} className="w-5 h-5" />
          </span>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 text-sm border-2 rounded-xl outline-none transition-colors
            ${icon ? 'pl-12' : ''}
            ${error ? 'border-danger-500 focus:border-danger-500' : 'border-gray-200 focus:border-primary-500'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-danger-500">{error}</span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
