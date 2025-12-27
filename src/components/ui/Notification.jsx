import { useApp } from '@context/AppContext'
import Icon from './Icon'

const Notification = () => {
  const { notification } = useApp()

  if (!notification) return null

  const styles = {
    success: 'bg-success-100 text-success-700 border-success-200',
    error: 'bg-danger-100 text-danger-700 border-danger-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200',
    info: 'bg-primary-100 text-primary-700 border-primary-200',
  }

  const icons = {
    success: 'CheckCircle',
    error: 'AlertCircle',
    warning: 'AlertCircle',
    info: 'AlertCircle',
  }

  return (
    <div
      className={`fixed top-5 right-5 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg z-50 animate-fade-in ${
        styles[notification.type] || styles.success
      }`}
    >
      <Icon name={icons[notification.type] || icons.success} className="w-5 h-5" />
      <span className="font-medium">{notification.message}</span>
    </div>
  )
}

export default Notification
