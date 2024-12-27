import React, { useEffect, useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './PlanTrip.css';
import MapRenderer from '../../component/PlanTrip/MapRenderer';
import usePlanData from '../../component/PlanTrip/usePlanData';

function EditPlan() {
  const { id } = useParams(); // URL에서 id 가져오기
  // Google Maps API 로드
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDYcmeImkXId7f8bF5GT1N3bWEDAhnp-rM', // API 키
  });

  // 네비게이션과 위치 상태
  const navigate = useNavigate();
  const location = useLocation();
  const { cityName, regionId, startDate, endDate } = location.state || {};

  // 상태 변수
  const [plannerTitle, setPlannerTitle] = useState(''); // 사용자 입력 상태
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false); // 플랜 저장 모달 상태
  const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 }); // 지도 중심
  const [dailyPlans, setDailyPlans] = useState({}); // 날짜별 장소 상태
  const [selectedPlace, setSelectedPlace] = useState(null); // InfoWindow에서 표시할 선택된 장소
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const [selectedDay, setSelectedDay] = useState(null); // 선택된 Day
  const [showPlaceList, setShowPlaceList] = useState(false); // 장소 목록 표시 여부
  const [categoryFilter, setCategoryFilter] = useState('전체'); // 필터링된 카테고리
  const [expandedPlaceId, setExpandedPlaceId] = useState(null); // 확장된 장소 ID 상태
  const [selectedCategory, setSelectedCategory] = useState('전체'); // 선택된 카테고리 저장
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지

  // 장소 데이터 가져오기
  const { locations, totalPages } = usePlanData(
      regionId,
      currentPage,
      searchTerm,
      categoryFilter
  );

  useEffect(() => {
    console.log('Locations from usePlanData:', locations);
    console.log(regionId);

    console.log('Total pages from usePlanData:', totalPages);
  }, [locations, totalPages]);

  // 플래너 데이터 로드
  useEffect(() => {
    const fetchPlanner = async () => {
      try {
        const response = await axios.get(
            `http://localhost:5050/api/planner/${id}`
        );
        const plannerData = response.data;

        setPlannerTitle(plannerData.plannerTitle || '');

        // 플랜 데이터를 상태로 설정
        const plans = plannerData.dailyPlans.reduce((acc, plan) => {
          acc[plan.planDate] = plan.toDos;
          return acc;
        }, {});
        setDailyPlans(plans);

        // 지도 중심 초기화
        const allPlaces = Object.values(plans).flat();
        if (allPlaces.length > 0) {
          const firstPlace = allPlaces[0];
          setCenter({ lat: firstPlace.latitude, lng: firstPlace.longitude });
        }
      } catch (error) {
        console.error('플래너 데이터를 불러오는 데 실패했습니다:', error);
      }
    };

    fetchPlanner();
  }, [id]);

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
      dates.push(new Date(currentDate).toISOString().split('T')[0]);
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
    setCategoryFilter(category); // 필터 상태 업데이트
    setCurrentPage(1); // 페이지 초기화
  };

  // 여행지 추가 버튼 클릭 시 장소 목록 표시
  const handleShowPlaceList = (day) => {
    setSelectedDay(day); // 선택된 Day 설정
    setShowPlaceList(true); // 장소 목록 표시
  };

  // 날짜별 장소 추가 핸들러
  const handleAddPlace = (place) => {
    if (!selectedDay) return; // 선택된 Day가 없으면 리턴

    setDailyPlans((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), place],
    }));
    setCenter({ lat: place.latitude, lng: place.longitude });
    // setShowPlaceList(false); // 장소를 추가한 후 목록 닫기
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

  const handleUpdate = async () => {
    const UpdatePlanner = {
      plannerId: id, // `id`를 plannerId로 추가
      plannerTitle: plannerTitle || `${cityName} 여행 계획`, // 기본값 처리
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
        })),
      })),
    };

    console.log(
        '전송할 Planner Data (Update):',
        JSON.stringify(UpdatePlanner, null, 2)
    );

    // URL 경로에서 id 제거
    const url = 'http://localhost:5050/api/planner/update';

    try {
      const response = await axios.put(url, UpdatePlanner);
      console.log('서버 응답 데이터 (Update):', response.data); // 서버 응답 확인

      alert('플랜이 성공적으로 수정되었습니다!');
      navigate(`/view-plan/${id}`);
    } catch (error) {
      console.error('플랜 수정 실패:', error); // 에러 로그 확인
      console.error('Axios Error Details:', {
        message: error.message,
        code: error.code,
        response: error.response,
      });
      alert('플랜 수정 중 오류가 발생했습니다.');
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
                                  src={place.placeImgUrl || '/images/placeholder.jpg'}
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

            <button onClick={() => setIsSaveModalOpen(true)}>
              플랜 수정하기
            </button>
          </div>
          {/* 플랜 저장 모달 */}
          {isSaveModalOpen && (
              <div
                  className="modalOverlay"
                  onClick={() => setIsSaveModalOpen(false)}
              >
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                  <h2>플래너 제목 입력</h2>
                  <input
                      type="text"
                      value={plannerTitle}
                      onChange={(e) => setPlannerTitle(e.target.value)}
                      placeholder={`${cityName} 여행 계획`}
                      className="plannerTitleInput"
                  />
                  <div className="modalButtons">
                    <button onClick={handleUpdate}>저장</button>
                    <button onClick={() => setIsSaveModalOpen(false)}>취소</button>
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
                  {['전체', '관광명소', '음식', '쇼핑', '문화', '랜드마크'].map(
                      (category) => (
                          <button
                              key={category}
                              className={`categoryTag ${
                                  selectedCategory === category ? 'selected' : ''
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
                                src={place.placeImgUrl || '/images/placeholder.jpg'}
                                alt={place.locationName}
                                className="placeImage"
                            />
                            <div className="placeInfo">
                              <div className="placeDetails">
                                <span className="placeName">{place.locationName}</span>
                                <p className="placeRating">
                                  평점: ⭐ {place.googleRating || '정보 없음'}
                                </p>
                                <p className="placeAddress">{place.formattedAddress}</p>
                                {expandedPlaceId === place.locationId && (
                                    <p className="placeDescription">
                                      {place.description || '상세 설명이 없습니다.'}
                                    </p>
                                )}
                                <span
                                    className="toggleText"
                                    onClick={() => toggleExpand(place.locationId)}
                                >
                          {expandedPlaceId === place.locationId
                              ? '접기'
                              : '더보기'}
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

                <div className="loadMoreContainer">
                  {currentPage < totalPages && (
                      <button
                          className="loadMoreButton"
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                      >
                        더보기
                      </button>
                  )}
                </div>
              </div>
          )}

          <div className="mapContainer">
            <MapRenderer
                center={center}
                markers={Object.values(dailyPlans).flat()}
                selectedPlace={selectedPlace}
                onMarkerClick={handleMarkerClick}
                onCloseInfoWindow={handleCloseModal}
            />
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

export default EditPlan;