// src/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(Cookies.get('isLoggedIn') === 'true');
    const location = useLocation(); // Hook to listen to route changes

    // This effect re-checks the cookie every time the user navigates to a new page.
    // This ensures the state is always in sync, even with browser back/forward.
    useEffect(() => {
        const loggedInStatus = Cookies.get('isLoggedIn') === 'true';
        if (loggedInStatus !== isLoggedIn) {
            setIsLoggedIn(loggedInStatus);
        }
    }, [location.pathname]); // Dependency on the URL path

    const login = () => {
        // This function should be called from your AuthenticationForm after a successful API login
        setIsLoggedIn(true);
    };

    const logout = async () => {
        try {
            // Clear the backend HttpOnly cookie
            await axios.post('http://localhost:8081/api/auth/logout', {}, { withCredentials: true });
            // Clear the frontend-readable cookie
            Cookies.remove('isLoggedIn', { path: '/' });
            Cookies.remove('jwt-token', { path: '/api' });
            setIsLoggedIn(false);
        } catch (error) {
            console.error("Logout failed", error);
            // Even if the API call fails, force a frontend logout
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
