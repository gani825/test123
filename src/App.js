import React, { createContext, useState } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home/Home';
import Plan from './pages/plan/Plan';
import Attractions from './pages/Attractions/Attractions';
import AttractionDetail from './pages/Attractions/AttractionDetail';
import Community from './pages/community/Community';
import SignIn from './pages/User/SignIn';
import Register from './pages/User/Register';
import SelectDates from './pages/plan/SelectDates';
import PlanTrip from './pages/plan/PlanTrip';
import MenuBar from './component/MenuBar';
import ViewPlan from './pages/plan/ViewPlan';
import PlanDetails from './pages/plan/PlanDetails';
import PlannerList from './pages/test/PlannerList';
import EditPlan from './pages/plan/EditPlan';

// AuthContext 생성
export const AuthContext = createContext({
    user: null,
    setUser: () => {}, // 기본값
    isAuthenticated: false,
    setIsAuthenticated: () => {},
});
function App() {
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
            <Router>

                    <div className="header">
                        <MenuBar />
                    </div>


          <div className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/select-dates" element={<SelectDates />} />
              <Route path="/plan-trip" element={<PlanTrip />} />
              <Route path="/view-plan" element={<ViewPlan />} />
              <Route path="/attractions" element={<Attractions />} />
              <Route path="/community" element={<Community />} />
              <Route path="/signin" element={<SignIn />} />
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
        </Router>
      </AuthContext.Provider>
    </div>
  );
}

export default App;

