import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedLoginStatus = localStorage.getItem('isLoggedIn');
    return savedLoginStatus === 'true' || false;
  });

  const login = () => {
    console.log('Logging in');
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    console.log('Is Logged In:', true);
  };

  const logout = () => {
    console.log('Logging out');
    setIsLoggedIn(false);
    localStorage.setItem('isLoggedIn', 'false');
    console.log('Is Logged In:', false);
  };

  useEffect(() => {
    const savedLoginStatus = localStorage.getItem('isLoggedIn');
    if (savedLoginStatus === 'true') {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
