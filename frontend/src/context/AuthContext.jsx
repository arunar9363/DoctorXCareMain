import { createContext, useState, useEffect, useCallback, useContext } from 'react'
import { getMeAPI } from '../api/auth.api.js'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

export function AuthProvider(props) {
  const children = props.children

  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          const data = await getMeAPI()
          setUser(data.data?.user || data.user || data)
          setToken(savedToken)
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          setToken(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  // Handles both call styles:
  // login(token, user)  ← RegisterPage
  // login(user, token)  ← LoginModal
  const login = useCallback((firstArg, secondArg) => {
    let jwtToken, userData
    if (typeof firstArg === 'string') {
      jwtToken = firstArg
      userData = secondArg
    } else {
      userData = firstArg
      jwtToken = secondArg
    }
    localStorage.setItem('token', jwtToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(jwtToken)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
  }, [])

  const updateUser = useCallback((updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider