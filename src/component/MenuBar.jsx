import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../App";
import './MenuBar.css';

const MenuBar = () => {
    const { isAuthenticated, clearUser } = useContext(AuthContext);

    const handleLogout = () => {
        clearUser();
        alert("로그아웃 되었습니다.");
    };

    return (
        <div className="MenuBar">
            <div className="logo">logo</div>
            <div className="navigation">
                <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : ""}>홈</NavLink>
                <NavLink to="/plan" className={({ isActive }) => isActive ? "active-link" : ""}>여행 계획</NavLink>
                <NavLink to="/attractions" className={({ isActive }) => isActive ? "active-link" : ""}>관광지 및 여행 시설</NavLink>
                <NavLink to="/community" className={({ isActive }) => isActive ? "active-link" : ""}>커뮤니티</NavLink>
                {isAuthenticated ? (
                    <NavLink
                        to="/"
                        onClick={handleLogout}
                        className={({ isActive }) => isActive ? "active-link" : ""}
                    >
                        로그아웃
                    </NavLink>
                ) : (
                    <NavLink
                        to="/signin"
                        className={({ isActive }) => isActive ? "active-link" : ""}
                    >
                        로그인
                    </NavLink>
                )}
            </div>
        </div>
    );
};

export default MenuBar;
