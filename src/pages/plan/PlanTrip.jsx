import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./PlanTrip.css";

function PlanTrip() {
    // Google Maps API 로드
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyCShblMMYThZxLOVypghTgG7XRwFpCL7RI", // API 키
    });

    // 네비게이션과 위치 상태
    const navigate = useNavigate();
    const location = useLocation();
    const { cityName, startDate, endDate } = location.state || {};

    // 상태 변수
    const [allPlaces, setAllPlaces] = useState([]); // 전체 장소 목록
    const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 }); // 지도 중심
    const [dailyPlans, setDailyPlans] = useState({}); // 날짜별 장소 상태
    const [selectedPlace, setSelectedPlace] = useState(null); // 모달에 표시할 선택된 장소
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태

    // 출발일과 도착일 기준으로 날짜 생성
    useEffect(() => {
        if (startDate && endDate) {
            const dates = generateDatesBetween(startDate, endDate);
            const initialDailyPlans = {};
            dates.forEach((date) => (initialDailyPlans[date] = []));
            setDailyPlans(initialDailyPlans);
        }
    }, [startDate, endDate]);

    // 시작일과 종료일 사이의 날짜 생성 함수
    const generateDatesBetween = (startDate, endDate) => {
        const dates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= new Date(endDate)) {
            dates.push(new Date(currentDate).toISOString().split("T")[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };

    // 백엔드에서 장소 데이터 불러오기
    useEffect(() => {
        if (cityName) {
            axios
                .get("http://localhost:5050/api/locations/by-region", {
                    params: { cityName: cityName },
                })
                .then((response) => setAllPlaces(response.data))
                .catch((error) => console.error("장소 데이터 오류:", error));
        }
    }, [cityName]);

    // 날짜별 장소 추가 핸들러
    const handleAddPlace = (date, place) => {
        setDailyPlans((prev) => ({
            ...prev,
            [date]: [...(prev[date] || []), place],
        }));
        setCenter({ lat: place.latitude, lng: place.longitude });
    };

    // 날짜별 장소 삭제 핸들러
    const handleRemovePlace = (date, locationId) => {
        setDailyPlans((prev) => ({
            ...prev,
            [date]: prev[date].filter((p) => p.locationId !== locationId),
        }));
    };

    // 마커 클릭 (모달 열기)
    const handleMarkerClick = (place) => {
        setSelectedPlace(place);
        setIsModalOpen(true);
    };

    // 모달 닫기 핸들러
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPlace(null);
    };

    // 데이터 로딩 상태
    if (!isLoaded) return <p>Loading...</p>;

    return (
        <div className="planTripContainer">
            {/* 여행 계획 제목 및 날짜 */}
            <h2>{cityName} 여행 계획</h2>
            <p>
                {startDate} ~ {endDate}
            </p>

            <div className="mainContent">
                {/* 좌측: 장소 목록 */}
                <div className="placeList">
                    <h3>장소 목록</h3>
                    <ul>
                        {allPlaces.map((place) => (
                            <li key={place.locationId} className="placeItem">
                                <span>{place.locationName}</span>
                                <select onChange={(e) => handleAddPlace(e.target.value, place)} defaultValue="">
                                    <option value="" disabled>
                                        날짜 선택
                                    </option>
                                    {Object.keys(dailyPlans).map((date) => (
                                        <option key={date} value={date}>
                                            {date}
                                        </option>
                                    ))}
                                </select>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 중앙: 날짜별 선택된 장소 */}
                <div className="selectedList">
                    <h3>날짜별 선택된 장소</h3>
                    {Object.entries(dailyPlans).map(([date, places]) => (
                        <div key={date} className="dailyPlanContainer">
                            <h4>{date}</h4>
                            {places.length > 0 ? (
                                places.map((place) => (
                                    <div key={place.locationId} className="selectedPlaceCard">
                                        <span>{place.locationName}</span>
                                        <button onClick={() => handleRemovePlace(date, place.locationId)}>삭제</button>
                                    </div>
                                ))
                            ) : (
                                <p>선택된 장소가 없습니다.</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* 우측: 지도 */}
                <div className="mapContainer">
                    <GoogleMap mapContainerClassName="mapContainer" center={center} zoom={12}>
                        {Object.values(dailyPlans)
                            .flat()
                            .map((place) => (
                                <Marker
                                    key={place.locationId}
                                    position={{ lat: place.latitude, lng: place.longitude }}
                                    onClick={() => handleMarkerClick(place)}
                                />
                            ))}
                    </GoogleMap>
                </div>
            </div>

            {/* 모달 */}
            {isModalOpen && selectedPlace && (
                <div className="modalOverlay" onClick={handleCloseModal}>
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedPlace.locationName}</h2>
                        <p>주소: {selectedPlace.formattedAddress}</p>
                        <button onClick={handleCloseModal}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlanTrip;
