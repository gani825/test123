import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ViewPlan.css';

function ViewPlan() {
    const location = useLocation();
    const navigate = useNavigate();
    const { dailyPlans, cityName } = location.state || {};

    if (!dailyPlans || !cityName) {
        return (
            <div>
                <p>여행 계획이 없습니다.</p>
                <button onClick={() => navigate(-1)}>돌아가기</button>
            </div>
        );
    }

    return (
        <div className="viewPlanContainer">
            <h2>나만의 여행계획</h2>
            {Object.entries(dailyPlans).map(([date, places], index) => (
                <div key={date} className="dailyPlan">
                    <h3>Day {index + 1} - {date}</h3>
                    <ul>
                        {places.map((place) => (
                            <li key={place.locationId}>
                                <h4>{place.locationName}</h4>
                                <p>{place.formattedAddress}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            <button onClick={() => navigate(-1)}>계획 수정하기</button>
        </div>
    );
}

export default ViewPlan;
