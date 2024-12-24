import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ViewPlan.css";

function ViewPlan() {
    const location = useLocation();
    const navigate = useNavigate();
    const { dailyPlans, cityName, plannerTitle } = location.state || {};

    if (!dailyPlans || !cityName) {
        return (
            <div className="planviewNoPlanContainer">
                <p>여행 계획이 없습니다.</p>
                <button className="planviewBackButton" onClick={() => navigate(-1)}>
                    돌아가기
                </button>
            </div>
        );
    }

    // 날짜별 그룹화 (한 줄에 3개의 Day씩 나누기)
    const dailyPlansArray = Object.entries(dailyPlans);
    const groupedPlans = [];
    for (let i = 0; i < dailyPlansArray.length; i += 3) {
        groupedPlans.push(dailyPlansArray.slice(i, i + 3));
    }

    return (
        <div className="planviewContainer">
            <header className="planviewHeader">
                <h2>{plannerTitle || "나만의 여행계획"}</h2>
            </header>

            <div className="planviewDateRange">
                <p>2024-12-24 ~ 2024-12-26</p>
            </div>

            {/* 그룹화된 Day들 출력 */}
            {groupedPlans.map((group, groupIndex) => (
                <div key={groupIndex} className="planviewDaysRow">
                    {group.map(([date, places], index) => (
                        <div key={date} className="planviewDailyPlan">
                            <div className="planviewDayHeader">
                                <h3>{`DAY ${groupIndex * 3 + index + 1}`}</h3>
                                <span>{date}</span>
                            </div>
                            <div className="planviewPlacesContainer">
                                {places.map((place) => (
                                    <div key={place.locationId} className="planviewPlaceCard">
                                        <img
                                            src={place.placeImgUrl || "/images/placeholder.jpg"}
                                            alt={place.locationName}
                                            className="planviewPlaceImage"
                                        />
                                        <div className="planviewPlaceInfo">
                                            <h4>{place.locationName}</h4>
                                            <p>{place.formattedAddress}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            <div className="planviewActionButtons">
                <button
                    className="planviewEditButton"
                    onClick={() =>
                        navigate("/edit-plan", {
                            state: {dailyPlans, cityName, plannerTitle},
                        })
                    }
                >
                    계획 수정하기
                </button>
            </div>
        </div>
    );
}

export default ViewPlan;
