// src/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

// Configure a default base URL for axios if you haven't already.
// For production, this will be a relative path if you use a Netlify proxy.
// For development, it can be the full localhost URL.
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8081';

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
            // The backend is responsible for clearing the HttpOnly JWT cookie.
            // The frontend only clears what it can access.
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
