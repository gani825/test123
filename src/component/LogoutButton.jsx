import React, { useContext } from 'react';
import { AuthContext } from '../App';
import { logout } from '../services/authService';

function LogoutButton() {
    const { setUser, setIsAuthenticated } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        setUser(null);
        setIsAuthenticated(false);
        alert('로그아웃 성공!');
    };

    return <button onClick={handleLogout}>로그아웃</button>;
}

export default LogoutButton;
