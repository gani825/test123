import { NavLink } from "react-router-dom";
import './MenuBar.css';

const MenuBar = () => {
    return (
        <div className="MenuBar">
            <div className="logo">logo</div>
            <div className="navigation">
                <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : ""}>홈</NavLink>
                <NavLink to="/plan" className={({ isActive }) => isActive ? "active-link" : ""}>여행 계획</NavLink>
                <NavLink to="/attractions" className={({ isActive }) => isActive ? "active-link" : ""}>관광지 및 여행 시설</NavLink>
                <NavLink to="/community" className={({ isActive }) => isActive ? "active-link" : ""}>커뮤니티</NavLink>
                <NavLink to="/signin" className={({ isActive }) => isActive ? "active-link" : ""}>로그인</NavLink>
            </div>
        </div>
    );
};

export default MenuBar;
