import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {

  const context = useContext(AuthContext)
  const { user, setUser, loading, setLoading, authLoading, setAuthLoading } =
    context;
  
  const handleLogin = async ({ email, password }) => {
    setLoading(true)
    try {
      const data = await login({ email, password })
      setUser(data.user)
    } catch (err) {
    } finally {
        setLoading(false)
    }
  } 

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true)
    try {
      const data = await register({ username, email, password })
      setUser(data.user)
    } catch (err) {
      throw err
    } finally {
      setLoading(false);
    }  
  }

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null); // ← bas itna kaafi hai
    } catch {
      setUser(null); // ← error aaye tab bhi logout kar do
    }
  };

    useEffect(() => {
      const getAndSetUser = async () => {
        try {
          const data = await getMe();
          setUser(data.user);
        } catch(err) { } finally {
          setLoading(false);
        }
      }

      getAndSetUser()
    }, [])
  
  return {
    user,
    loading,
    authLoading, handleRegister,
    handleLogin,
    handleLogout,
  };
}