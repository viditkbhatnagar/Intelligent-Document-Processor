import { createContext, useContext, ReactNode } from 'react'

interface AuthContextType {
  user: null
  login: () => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // No authentication required for demo
  const value: AuthContextType = {
    user: null,
    login: async () => {},
    logout: () => {},
    isAuthenticated: true // Always authenticated for demo
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}