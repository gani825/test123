import React, { createContext, useState } from 'react';
import './styles/reset.css';

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Home from './pages/Home/Home';
import Plan from './pages/plan/Plan';
import Attractions from './pages/Attractions/Attractions';
import AttractionDetail from './pages/Attractions/AttractionDetail';
import Community from './pages/community/Community';
import SignIn from './pages/User/SignIn';
import SignUp from './pages/User/SignUp';
import SelectDates from './pages/plan/SelectDates';
import PlanTrip from './pages/plan/PlanTrip';
import MenuBar from './component/MenuBar';
import ViewPlan from './pages/plan/ViewPlan';
import PlanDetails from './pages/plan/PlanDetails';
import PlannerList from './pages/test/PlannerList';
import EditPlan from './pages/plan/EditPlan';
import MyPage from './MyPage/MyPage';
import Footer from "./component/Footer";

// AuthContext 생성
export const AuthContext = createContext({
    user: null,
    setUser: () => {}, // 기본값
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    saveUser: () => {},
    clearUser: () => {},
});

function NavigationBar() {
    return null;
}

function Register() {
    return null;
}

function App() {
    // 특정 페이지 Footer 렌더링 제외
    const location = useLocation();
    const shouldRenderFooter =
        location.pathname !== '/plan-trip' &&
        location.pathname !== '/signin' &&
        location.pathname !== '/signup' &&
        location.pathname !== '/planner/edit/:id';

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // 인증 여부 초기화 시 만료 시간 고려
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const tokenExpiry = localStorage.getItem('accessTokenExpiry');
        return !!localStorage.getItem('accessToken') && Date.now() < tokenExpiry;
    });

    const saveUser = (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
    };

    const clearUser = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessTokenExpiry'); // 만료 시간도 삭제
        localStorage.removeItem('userEmail'); // userEmail 삭제
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <div className="App">
            <AuthContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated, saveUser, clearUser }}>

                    <div className="header">
                        <MenuBar />
                        <NavigationBar /> {/* NavigationBar 추가 */}
                    </div>
                    <div className="main">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/plan" element={<Plan />} />
                            <Route path="/select-dates" element={<SelectDates />} />
                            <Route path="/plan-trip" element={<PlanTrip />} />
                            <Route path="/view-plan/:plannerId" element={<ViewPlan />} />
                            <Route path="/attractions" element={<Attractions />} />
                            <Route path="/community" element={<Community />} />
                            <Route path="/signup" element={!isAuthenticated ? <SignUp /> : <Navigate to="/" />} />
                            <Route path="/signin" element={<SignIn />} />
                            <Route path="/mypage" element={<MyPage />} /> {/* 마이페이지 라우트 추가 */}
                            <Route
                                path="/attractionDetail/:locationId"
                                element={<AttractionDetail />}
                            />
                            <Route path="/planner-list" element={<PlannerList />} />
                            <Route path="/planner-details/:id" element={<PlanDetails />} />
                            <Route path="/planner/edit/:id" element={<EditPlan />} />
                            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

                        </Routes>
                    </div>
                    {/* 특정 페이지 Footer 렌더링 제외 */}
                    {shouldRenderFooter && <Footer />}
            </AuthContext.Provider>
        </div>
    );
}

export default App;