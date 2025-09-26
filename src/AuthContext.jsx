// src/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(Cookies.get('isLoggedIn') === 'true');
    const location = useLocation();

    useEffect(() => {
        const loggedInStatus = Cookies.get('isLoggedIn') === 'true';
        if (loggedInStatus !== isLoggedIn) {
            setIsLoggedIn(loggedInStatus);
        }
    }, [location.pathname]);

    const login = () => {
        setIsLoggedIn(true);
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error("Logout API call failed, proceeding with frontend logout.", error);
        } finally {
            Cookies.remove('isLoggedIn', { path: '/' });
            setIsLoggedIn(false);
        }
    };

    const value = { isLoggedIn, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
