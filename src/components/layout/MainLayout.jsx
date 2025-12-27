import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Notification from '@components/ui/Notification'
import { useApp } from '@context/AppContext'

const MainLayout = () => {
  const { sidebarCollapsed } = useApp()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-70'
        }`}
        style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}
      >
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
      <Notification />
    </div>
  )
}

export default MainLayout
