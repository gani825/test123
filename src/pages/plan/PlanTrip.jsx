import React, { useEffect, useState } from 'react';
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript,
} from '@react-google-maps/api';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './PlanTrip.css';

function PlanTrip() {
  // Google Maps API 로드
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCShblMMYThZxLOVypghTgG7XRwFpCL7RI', // API 키
  });

  // 네비게이션과 위치 상태
  const navigate = useNavigate();
  const location = useLocation();
  const { cityName, regionId, startDate, endDate } = location.state || {};

  // 상태 변수
  const [allPlaces, setAllPlaces] = useState([]); // 전체 장소 목록
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

  // 백엔드에서 장소 데이터 불러오기
  useEffect(() => {
    if (regionId) {
      axios
        .get('http://localhost:5050/api/locations/by-region', {
          params: { regionId }, // regionId 전달
        })
        .then((response) => {
          setAllPlaces(response.data); // 상태 업데이트
        })
        .catch((error) => {
          console.error('장소 데이터 오류:', error); // 에러 로그 출력
        });
    } else {
      console.error('regionId 값이 없습니다.'); // regionId가 없을 경우 로그 출력
    }
  }, [regionId]);

  // 장소의 세부 정보를 확장하거나 접는 함수
  const toggleExpand = (placeId) => {
    setExpandedPlaceId((prevId) => (prevId === placeId ? null : placeId));
  };

  // 카테고리와 검색어로 장소 목록 필터링
  const filteredPlaces = allPlaces.filter((place) => {
    const matchesSearchTerm = place.locationName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === '전체' || place.tags.includes(categoryFilter);
    return matchesSearchTerm && matchesCategory;
  });

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

    setDailyPlans((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), place],
    }));
    setCenter({ lat: place.latitude, lng: place.longitude });
    setShowPlaceList(false); // 장소를 추가한 후 목록 닫기
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
        </div>

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
              {[
                '전체',
                '관광명소',
                '음식',
                '쇼핑',
                '문화',
                '랜드마크',
                '놀이시설',
              ].map((category) => (
                <button
                  key={category}
                  className={`categoryTag ${
                    selectedCategory === category ? 'selected' : ''
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {selectedCategory === category ? category : `#${category}`}
                </button>
              ))}
            </div>

            <ul>
              {filteredPlaces.map((place) => (
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
          </div>
        )}

        <div className="mapContainer">
          <GoogleMap
            mapContainerClassName="mapContainer"
            center={center}
            zoom={12}
            options={{ mapTypeControl: false }}
          >
            {Object.values(dailyPlans)
              .flat()
              .map((place) => (
                <Marker
                  key={place.locationId}
                  position={{ lat: place.latitude, lng: place.longitude }}
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
