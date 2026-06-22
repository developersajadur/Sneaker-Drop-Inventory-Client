import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-white">Something went wrong.</h2>
          <p className="mb-6 text-sm text-gray-400">An unexpected error occurred. Please refresh the page.</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      )
    }

    return this.props.children
  }
}
