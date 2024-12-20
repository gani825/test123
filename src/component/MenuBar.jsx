import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './MenuBar.css';

const MenuBar = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/signin'); // 로그인 페이지로 이동
    };

    return (
        <div className="MenuBar">
            <div className="logo">logo</div>
            <div className="navigation">
                <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : ""}>홈</NavLink>
                <NavLink to="/plan" className={({ isActive }) => isActive ? "active-link" : ""}>여행 계획</NavLink>
                <NavLink to="/attractions" className={({ isActive }) => isActive ? "active-link" : ""}>관광지 및 여행 시설</NavLink>
                <NavLink to="/community" className={({ isActive }) => isActive ? "active-link" : ""}>커뮤니티</NavLink>
                <div className="login-link" onClick={handleLoginClick} style={{ cursor: 'pointer' }}>로그인</div>
            </div>
        </div>
    );
};

export default MenuBar;
