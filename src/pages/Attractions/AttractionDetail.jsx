import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const AttractionDetail = () => {
  const { locationId } = useParams();  // URL에서 locationId 파라미터를 받아옴
  const [location, setLocation] = useState(null);
  const [nearByLocations,setNearByLocations] = useState([])
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchLocationDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/api/locations/${locationId}`);
        setLocation(response.data);  // 상세 정보 저장
        console.log(response);
                // 상세 정보에서 위도와 경도를 가져옴
        const { latitude, longitude } = response.data;

        // 근처 장소 정보 가져오기
        const nearByResponse = await axios.get('http://localhost:5050/api/locations/getNearby', {
          params: {
            latitude,
            longitude,
            distance: 5, // 반경 5km
            sortValue: 'googleRating', // 평점 순 정렬
            sortDirection: 'desc', // 내림차순
          },
        });
        setNearByLocations(nearByResponse.data);
        console.log(nearByResponse)
      } catch (error) {
        console.error('Error fetching location details:', error);
      } finally {
        setLoading(false);  // 로딩 끝
      }
    };

    fetchLocationDetail();
  }, [locationId]);  // locationId가 변경될 때마다 요청 다시 보내기

  if (loading) {
    return <div>Loading...</div>;  // 로딩 중 표시
  }

  if (!location) {
    return <div>No details available for this location.</div>;  // location이 없을 경우 표시
  }

  return (
    <div>
      <h2>{location.locationName}</h2>
      <h3>{location.regionName}</h3>
      <img src={location.placeImgUrl} alt={location.locationName} />
      <p>{location.description}</p>
      <p>별점 평균 : {location.googleRating}</p>
      <p>총 리뷰 수 : {location.userRatingsTotal}</p>
      <p>주소 : {location.formattedAddress}</p>
      <p>전화번호 : {location.phoneNumber}</p>
      <p>운영 시간 : {location.openingHours}</p>
      <p>웹사이트 주소 : <a href={location.website} target="_blank" rel="noopener noreferrer">{location.website}</a></p>

      <h3>근처의 다른 장소</h3>
      {nearByLocations.length > 0 ? (
        <ul>
          {nearByLocations.map((nearby) => (
            <li key={nearby.id}>
              <h4>{nearby.locationName}</h4>
              <p>{nearby.formattedAddress}</p>
              <p>평점: {nearby.googleRating}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>근처에 표시할 장소가 없습니다.</p>
      )}
    </div>
  );
};

export default AttractionDetail;
