import React, { createContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Plan from './pages/plan/Plan';
import Attractions from './pages/Attractions/Attractions';
import Community from './pages/community/Community';
import SignIn from './pages/SignIn/SignIn';
import MenuBar from './component/MenuBar';
import SelectDates from './pages/plan/SelectDates';
import PlanTrip from './pages/plan/PlanTrip';

// AuthContext 생성
export const AuthContext = createContext();

function App() {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <div className="App">
            <AuthContext.Provider value={{ user, isAuthenticated, setUser, setIsAuthenticated }}>
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
                            <Route path="/attractions" element={<Attractions />} />
                            <Route path="/community" element={<Community />} />
                            <Route path="/signin" element={<SignIn />} />
                        </Routes>
                    </div>
                </Router>
            </AuthContext.Provider>
        </div>
    );
}

export default App;
