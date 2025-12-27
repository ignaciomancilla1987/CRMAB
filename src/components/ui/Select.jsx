import { forwardRef } from 'react'

const Select = forwardRef(({
  label,
  error,
  required,
  options = [],
  placeholder = 'Seleccione...',
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
      <select
        ref={ref}
        className={`
          w-full px-4 py-3 text-sm border-2 rounded-xl outline-none transition-colors
          bg-white cursor-pointer
          ${error ? 'border-danger-500 focus:border-danger-500' : 'border-gray-200 focus:border-primary-500'}
          ${className}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-danger-500">{error}</span>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
