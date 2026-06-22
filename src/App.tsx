import { useState } from 'react'
import { Toaster } from 'sonner'
import { LayoutDashboard, Wrench, User } from 'lucide-react'
import ErrorBoundary from '@/components/ErrorBoundary'
import Dashboard from '@/pages/Dashboard'
import Forms from '@/pages/Forms'
import currentUserId, { currentUserName } from '@/lib/currentUser'

type Page = 'dashboard' | 'forms'

function App() {
  const [page, setPage] = useState<Page>('dashboard')

  const shortId = currentUserId.slice(0, 8)

  return (
    <>
      <Toaster richColors />
      {/* Nav bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="mx-auto max-w-7xl flex items-center gap-1 px-4 py-2">
          <button
            onClick={() => setPage('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              page === 'dashboard'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          <button
            onClick={() => setPage('forms')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              page === 'forms'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wrench className="h-4 w-4" />
            Actions
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User identity pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-800 border border-gray-700">
            <User className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-300 font-mono">
              {currentUserName || `You (${shortId}…)`}
            </span>
          </div>
        </div>
      </nav>
      <div className="pt-12">
        <ErrorBoundary>
          {page === 'dashboard' ? <Dashboard /> : <Forms />}
        </ErrorBoundary>
      </div>
    </>
  )
}

export default App
