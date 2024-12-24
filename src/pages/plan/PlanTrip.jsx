import React, { useEffect, useState } from "react";
import {
    GoogleMap,
    InfoWindow,
    Marker,
    useLoadScript,
} from "@react-google-maps/api";
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
    const { cityName, regionId, startDate, endDate } = location.state || {};

    // 상태 변수
    const [plannerTitle, setPlannerTitle] = useState(""); // 사용자 입력 상태
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false); // 플랜 저장 모달 상태
    const [locations, setLocations] = useState([]); // 장소 데이터
    const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 }); // 지도 중심
    const [dailyPlans, setDailyPlans] = useState({}); // 날짜별 장소 상태
    const [selectedPlace, setSelectedPlace] = useState(null); // InfoWindow에서 표시할 선택된 장소
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
    const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
    const [selectedDay, setSelectedDay] = useState(null); // 선택된 Day
    const [showPlaceList, setShowPlaceList] = useState(false); // 장소 목록 표시 여부
    const [categoryFilter, setCategoryFilter] = useState("전체"); // 필터링된 카테고리
    const [expandedPlaceId, setExpandedPlaceId] = useState(null); // 확장된 장소 ID 상태
    const [selectedCategory, setSelectedCategory] = useState("전체"); // 선택된 카테고리 저장
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [totalPages, setTotalPages] = useState(1); // 총 페이지 수


    // 장소 데이터 가져오기
    const fetchLocations = (reset = false) => {
        if (regionId) {
            axios
                .get("http://localhost:5050/api/locations/searchLocation", {
                    params: {
                        regionId, // 지역 ID 전달
                        page: currentPage - 1, // 0-based index
                        pageSize: 10,
                        keyword: searchTerm, // 검색어
                        tagNames: categoryFilter === "전체" ? "" : categoryFilter, // 카테고리 필터
                    },
                })
                .then((response) => {
                    console.log("백엔드에서 받은 데이터:", response.data.content); // 받은 데이터 확인
                    if (reset) {
                        setLocations(response.data.content); // 새 데이터로 초기화
                    } else {
                        setLocations((prev) => [...prev, ...response.data.content]); // 기존 데이터에 추가
                    }
                    setTotalPages(response.data.totalPages); // 총 페이지 수 업데이트
                })
                .catch((error) => console.error("데이터 로드 실패:", error));
        } else {
            console.error("regionId 값이 없습니다.");
        }
    };

    // 페이지 변경 시 데이터 요청
    useEffect(() => {
        fetchLocations();
    }, [currentPage]);

    // 검색어나 카테고리 변경 시 데이터 초기화
    useEffect(() => {
        setCurrentPage(1); // 페이지 초기화
        fetchLocations(true); // 초기화 후 데이터 요청
    }, [searchTerm, categoryFilter]);

    // dailyPlans 상태 변경 감지 및 Marker 렌더링
    useEffect(() => {
        const allPlaces = Object.values(dailyPlans).flat(); // 날짜별 모든 장소 합치기
        if (allPlaces.length > 0) {
            const lastAddedPlace = allPlaces[allPlaces.length - 1]; // 가장 마지막으로 추가된 장소
            setCenter({
                lat: lastAddedPlace.latitude,
                lng: lastAddedPlace.longitude,
            }); // 지도 중심 업데이트
        }
    }, [dailyPlans]);

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

    // 장소의 세부 정보를 확장하거나 접는 함수
    const toggleExpand = (placeId) => {
        setExpandedPlaceId((prevId) => (prevId === placeId ? null : placeId));
    };

    // 카테고리 클릭 핸들러
    const handleCategoryClick = (category) => {
        setSelectedCategory(category); // 선택된 카테고리 상태 업데이트
        setCategoryFilter(category); // 기존 필터 상태 업데이트
    };

    // 여행지 추가 버튼 클릭 시 장소 목록 표시
    const handleShowPlaceList = (day) => {
        setSelectedDay(day); // 선택된 Day 설정
        setShowPlaceList(true); // 장소 목록 표시
    };

    // 날짜별 장소 추가 핸들러
    const handleAddPlace = (place) => {
        if (!selectedDay) return; // 선택된 Day가 없으면 리턴

        // selectedDay를 'Day 1', 'Day 2' 형식으로 변환
        const dayIndex = Object.keys(dailyPlans).indexOf(selectedDay) + 1;
        const dayLabel = `Day ${dayIndex}`;

        // 알림창에 Day 형식으로 표시
        const confirmAdd = window.confirm(
            `${dayLabel} 여행지를 추가하시겠습니까?`
        );
        if (!confirmAdd) return; // 사용자가 취소를 누르면 추가하지 않음

        setDailyPlans((prev) => ({
            ...prev,
            [selectedDay]: [...(prev[selectedDay] || []), place],
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

    // 마커 클릭 (InfoWindow 열기)
    const handleMarkerClick = (place) => {
        setSelectedPlace(place);
    };

    // InfoWindow 닫기 핸들러
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPlace(null);
    };

    // 플랜 저장 핸들러
    const handleSavePlan = async () => {
        if (!plannerTitle.trim()) {
            alert("플래너 제목을 입력해주세요.");
            return;
        }

        const plannerData = {
            plannerTitle: plannerTitle || `${cityName} 여행 계획`,
            plannerStartDate: startDate,
            plannerEndDate: endDate,
            regionName: cityName,
            dailyPlans: Object.entries(dailyPlans).map(([date, places]) => ({
                planDate: date,
                toDos: places.map((place) => ({
                    locationId: place.locationId,
                    locationName: place.locationName,
                    formattedAddress: place.formattedAddress,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    placeImgUrl: place.placeImgUrl || "/images/placeholder.jpg", // 기본 이미지 포함
                })),
            })),
        };

        try {
            const response = await axios.post(
                "http://localhost:5050/api/planner/save",
                plannerData
            );

            console.log("플랜 저장 성공:", plannerData);
            alert("플랜이 성공적으로 저장되었습니다!");

            // ViewPlan 페이지로 이동하면서 데이터 전달
            navigate('/view-plan', {
                state: { dailyPlans, cityName, plannerTitle },
            });
        } catch (error) {
            console.error("플랜 저장 실패:", error);
            alert("플랜 저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaveModalOpen(false); // 모달 닫기
        }
    };

    // 데이터 로딩 상태
    if (!isLoaded) return <p>Loading...</p>;

    return (
        <div className="planTripContainer">
            <div className="mainContent">
                <div className="selectedList">
                    <div className="scheduleHeader">
                        <h3>{cityName} 일정 계획하기</h3>
                    </div>

                    {Object.entries(dailyPlans).map(([date, places], index) => (
                        <div key={date} className="dailyPlanContainer">
                            <div className="dayHeader">
                                <h4>Day {index + 1}</h4>
                                <span className="dateLabel">{date}</span>
                            </div>

                            <button
                                className="addPlaceButton"
                                onClick={() => handleShowPlaceList(date)}
                            >
                                여행지 추가 +
                            </button>

                            {places.length > 0 && (
                                <ul className="addedPlacesList">
                                    {places.map((place) => (
                                        <li key={place.locationId} className="selectedPlaceCard">
                                            <img
                                                src={place.placeImgUrl || "/images/placeholder.jpg"}
                                                alt={place.locationName}
                                                className="placeImage"
                                            />
                                            <div className="placeText">
                                                <span>{place.locationName}</span>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleRemovePlace(date, place.locationId)
                                                }
                                            >
                                                삭제
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                    <button className="plan-button" onClick={() => setIsSaveModalOpen(true)}>
                        플랜 저장
                    </button>
                </div>
                {/* 플랜 저장 모달 */}
                {isSaveModalOpen && (
                    <div className="modalOverlay" onClick={() => setIsSaveModalOpen(false)}>
                        <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                            <h3>플래너 제목을 입력해주세요.</h3>
                            <input
                                type="text"
                                value={plannerTitle}
                                onChange={(e) => setPlannerTitle(e.target.value)}
                                placeholder={`${cityName} 여행 계획`}
                                className="plannerTitleInput"
                            />
                            <div className="modalButtons">
                                <button className="SaveTitleButton" onClick={handleSavePlan}>저장</button>
                                <button className="CancellationButton" onClick={() => setIsSaveModalOpen(false)}>취소</button>
                            </div>
                        </div>
                    </div>
                )}

                {showPlaceList && (
                    <div className="placeList">
                        <h3>장소 목록</h3>
                        <input
                            type="text"
                            placeholder="여행지를 검색하세요."
                            className="searchBar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <div className="categoryTags">
                            {["전체", "관광명소", "음식", "쇼핑", "문화", "랜드마크"].map(
                                (category) => (
                                    <button
                                        key={category}
                                        className={`categoryTag ${
                                            selectedCategory === category ? "selected" : ""
                                        }`}
                                        onClick={() => handleCategoryClick(category)}
                                    >
                                        {selectedCategory === category ? category : `#${category}`}
                                    </button>
                                )
                            )}
                        </div>
                        <ul>
                            {locations
                                .filter(
                                    (place) =>
                                        !(dailyPlans[selectedDay] || []).some(
                                            (addedPlace) => addedPlace.locationId === place.locationId
                                        )
                                )
                                .map((place) => (
                                    <li key={place.locationId} className="placeItem">
                                        <img
                                            src={place.placeImgUrl || "/images/placeholder.jpg"}
                                            alt={place.locationName}
                                            className="placeImage"
                                        />
                                        <div className="placeInfo">
                                            <div className="placeDetails">
                                                <span className="placeName">{place.locationName}</span>
                                                <p className="placeRating">
                                                    평점: ⭐ {place.googleRating || "정보 없음"}
                                                </p>
                                                <p className="placeAddress">{place.formattedAddress}</p>
                                                {expandedPlaceId === place.locationId && (
                                                    <p className="placeDescription">
                                                        {place.description || "상세 설명이 없습니다."}
                                                    </p>
                                                )}
                                                <span
                                                    className="toggleText"
                                                    onClick={() => toggleExpand(place.locationId)}
                                                >
                          {expandedPlaceId === place.locationId
                              ? "접기"
                              : "더보기"}
                        </span>
                                            </div>
                                            <button
                                                className="addButton"
                                                onClick={() => handleAddPlace(place)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </li>
                                ))}
                        </ul>

                        <div className="plantripLoadMoreContainer">
                            {currentPage < totalPages && (
                                <button
                                    className="plantripLoadMoreButton"
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                >
                                    더보기
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="mapContainer">
                    <GoogleMap
                        mapContainerClassName="mapContainer"
                        center={center}
                        zoom={12}
                        options={{mapTypeControl: false}}
                    >
                        {Object.values(dailyPlans)
                            .flat()
                            .map((place) => (
                                <Marker
                                    key={place.locationId}
                                    position={{lat: place.latitude, lng: place.longitude}}
                                    onClick={() => handleMarkerClick(place)}
                                />
                            ))}

                        {selectedPlace && (
                            <InfoWindow
                                position={{
                                    lat: selectedPlace.latitude,
                                    lng: selectedPlace.longitude,
                                }}
                                onCloseClick={() => setSelectedPlace(null)}
                            >
                                <div className="infoWindowContent">
                                    <img
                                        src={selectedPlace.placeImgUrl || '/images/placeholder.jpg'}
                                        alt={selectedPlace.locationName}
                                        className="infoWindowImage"
                                    />
                                    <h3>{selectedPlace.locationName}</h3>
                                    <p>주소: {selectedPlace.formattedAddress}</p>
                                </div>
                            </InfoWindow>
                        )}
                        {/* "내 여행 계획 보기" 버튼 */}
                        <div className="viewPlanButtonContainer">
                            <button
                                className="viewPlanButton"
                                onClick={() => navigate('/view-plan', {state: {dailyPlans, cityName}})}
                            >
                                내 여행 계획 보기
                            </button>
                        </div>
                    </GoogleMap>
                </div>
            </div>

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