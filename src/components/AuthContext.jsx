import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/me');
      setUser(response.data);
    } catch (error) {
      console.error("Auth fetch user failed", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 expects username field
    formData.append('password', password);
    const response = await axios.post('http://localhost:8000/api/auth/login', formData);
    const newToken = response.data.access_token;
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    await fetchUser();
  };

  const register = async (username, email, password) => {
    await axios.post('http://localhost:8000/api/auth/register', { username, email, password });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
