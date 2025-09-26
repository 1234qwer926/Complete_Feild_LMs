// src/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(Cookies.get('isLoggedIn') === 'true');
    const location = useLocation();

    // This effect keeps the UI in sync if the user navigates with browser back/forward buttons
    useEffect(() => {
        const loggedInStatus = Cookies.get('isLoggedIn') === 'true';
        if (loggedInStatus !== isLoggedIn) {
            setIsLoggedIn(loggedInStatus);
        }
    }, [location.pathname]);

    /**
     * This function updates the application's state to reflect that the user is logged in.
     * It MUST be called by your login form after a successful API response.
     */
    const login = () => {
        setIsLoggedIn(true);
    };

    const logout = async () => {
        try {
            // This relative path requires the Netlify proxy configuration to work
            await axios.post('/api/auth/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error("Logout API call failed, proceeding with frontend logout.", error);
        } finally {
            // The frontend clears the readable cookie; the backend clears the HttpOnly one
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
