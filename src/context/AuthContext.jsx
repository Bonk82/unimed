import {createContext, useContext, useState} from 'react'

export const AuthContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);


// eslint-disable-next-line react/prop-types
export function AuthProvider({children}) {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);

  const logout = () => setUser(null);

  return (
      <AuthContext.Provider value={{user,login,logout}}>
          {children}
      </AuthContext.Provider>
  )
}