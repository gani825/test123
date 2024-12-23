import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import axios from 'axios';
import './AttractionDetail.css';

const AttractionDetail = () => {
  const { locationId } = useParams();  // URL에서 locationId 파라미터를 받아옵니다.
  const [location, setLocation] = useState(null);  // 장소의 상세 정보 상태
  const [nearbyLocations, setNearbyLocations] = useState([]);  // 근처 장소 목록 상태
  const [loading, setLoading] = useState(true);  // 로딩 상태

  const [latitude, setLatitude] = useState(null);  // 위도
  const [longitude, setLongitude] = useState(null);  // 경도
  const [distance, setDistance] = useState(5);  // 근처 장소를 찾을 최대 거리 (기본값: 5km)

  // 장소 상세 정보 요청
  useEffect(() => {
    const fetchLocationDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/api/locations/${locationId}`);
        setLocation(response.data);  // 받아온 장소 상세 정보를 상태에 저장
        setLatitude(response.data.latitude);  // 위도 설정
        setLongitude(response.data.longitude);  // 경도 설정
      } catch (error) {
        console.error('Error fetching location details:', error);
      } finally {
        setLoading(false);  // 로딩 완료
      }
    };

    fetchLocationDetail();  // 상세 정보 요청
  }, [locationId]);  // locationId가 변경될 때마다 다시 요청

  // 근처 장소 정보 요청
  useEffect(() => {
    if (latitude && longitude) {
      const fetchNearbyLocations = async () => {
        try {
          const response = await axios.get(`http://localhost:5050/api/locations/getNearby`, {
            params: {
              latitude,
              longitude,
              distance,
              sortValue: 'googleRating',  // 구글 평점 기준으로 정렬
              sortDirection: 'desc',  // 내림차순
            },
          });

          // 거리 계산 후, 자기 자신 제외 및 거리 단위 변환 (km -> m)
          const nearbyLocationsWithDistance = response.data
            .map((location) => ({
              ...location,
              distanceInMeters: Math.round(location.distance * 1000),  // km를 m로 변환
            }))
            .filter((location) => location.distanceInMeters > 0);  // 자기 자신 제외

          setNearbyLocations(nearbyLocationsWithDistance);  // 근처 장소 목록 저장
        } catch (error) {
          console.error('Error fetching nearby locations:', error);
        }
      };

      fetchNearbyLocations();  // 근처 장소 요청
    }
  }, [latitude, longitude, distance]);  // 위도, 경도, 거리 변경 시마다 요청

  // Google Maps API를 로드하는 훅
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCShblMMYThZxLOVypghTgG7XRwFpCL7RI',  // 발급받은 API 키 입력
  });

  // 로딩 중일 경우
  if (loading) {
    return <div>Loading...</div>;
  }

  // 장소 상세 정보가 없을 경우
  if (!location) {
    return <div>No details available for this location.</div>;
  }

  return (
    <div className="attraction-detail-container">
      {/* 장소 상세 정보 표시 */}
      <h2>{location.locationName}</h2>
      <h3>{location.regionName}</h3>
      <img src={location.placeImgUrl} alt={location.locationName} />
      {/* 지도 로딩 여부 확인 */}
      {isLoaded ? (
        <GoogleMap
          center={{ lat: latitude, lng: longitude }}  // 지도 중심을 메인 장소로 설정
          zoom={15}  // 지도 확대 비율
          mapContainerStyle={{ width: '100%', height: '400px' }}  // 지도 스타일
          options={{
            disableDefaultUI: true,  // 기본 UI 요소 숨기기 (지도 컨트롤, 확대/축소 등)
            scrollwheel: false,  // 마우스 휠로 지도 이동 방지
            draggable: false,  // 지도 드래그 이동 방지
            gestureHandling: 'none',  // 제스처로 지도 이동 방지
            disableDefaultUI: true,  // 기본 UI 요소 비활성화
            clickableIcons: false,  // 기본 아이콘 클릭 방지
          }}
        >
          {/* 고정된 마커 추가 */}
          <Marker
            position={{ lat: latitude, lng: longitude }}
            draggable={false}  // 마커 이동 비활성화
          />
        </GoogleMap>
      ) : (
        <div>Loading map...</div>
      )}
      <p>{location.description}</p>
      <p>별점 평균 : {location.googleRating}</p>
      <p>총 리뷰 수 : {location.userRatingsTotal}</p>
      <p>주소 : {location.formattedAddress}</p>
      <p>전화번호 : {location.phoneNumber}</p>
      <p>운영 시간 : {location.openingHours}</p>
      <p>
        웹사이트 주소 :{' '}
        <a href={location.website} target="_blank" rel="noopener noreferrer">
          {location.website}
        </a>
      </p>

      {/* 근처 장소 정보 표시 */}
      <h3>주변 장소</h3>
      {nearbyLocations.length > 0 ? (
        <ul className="nearby-locations-list">
          {/* 최대 4개까지만 근처 장소 출력 */}
          {nearbyLocations.slice(0, 4).map((nearbyLocation) => (
            <li key={nearbyLocation.locationId} className="nearby-location-item">
              {/* 근처 장소 클릭 시 해당 상세 페이지로 이동 */}
              <Link to={`/attractionDetail/${nearbyLocation.locationId}`} className="nearby-link">
                <img src={nearbyLocation.placeImgUrl} alt={nearbyLocation.locationName} />
                <h4>{nearbyLocation.locationName}</h4>
                <p>{nearbyLocation.regionName}</p>
                <p>별점 : {nearbyLocation.googleRating}</p>
                <p>거리 {nearbyLocation.distanceInMeters} m</p>
                <p className="description">
                  {/* description이 길면 50자까지 잘라서 표시 */}
                  {nearbyLocation.description.length > 50
                    ? `${nearbyLocation.description.substring(0, 50)}...`
                    : nearbyLocation.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>근처에 다른 장소가 없습니다.</p>  // 근처 장소가 없으면 메시지 표시
      )}
    </div>
  );
};

export default AttractionDetail;
