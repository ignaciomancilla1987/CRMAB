import Icon from './Icon'

const variants = {
  primary: 'bg-primary-800 text-white hover:bg-primary-700',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  success: 'bg-success-600 text-white hover:bg-success-700',
  danger: 'bg-danger-500 text-white hover:bg-danger-600',
  warning: 'bg-warning-500 text-white hover:bg-warning-600',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <Icon name={icon} className="w-4 h-4" />}
          {children}
          {icon && iconPosition === 'right' && <Icon name={icon} className="w-4 h-4" />}
        </>
      )}
    </button>
  )
}

export default Button
