import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './AttractionDetail.css';

const AttractionDetail = () => {
  const { locationId } = useParams();
  const [location, setLocation] = useState(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [distance, setDistance] = useState(5);

  useEffect(() => {
    const fetchLocationDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/api/locations/${locationId}`);
        setLocation(response.data);
        setLatitude(response.data.latitude);
        setLongitude(response.data.longitude);
      } catch (error) {
        console.error('Error fetching location details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationDetail();
  }, [locationId]);

  useEffect(() => {
    if (latitude && longitude) {
      const fetchNearbyLocations = async () => {
        try {
          const response = await axios.get(`http://localhost:5050/api/locations/getNearby`, {
            params: {
              latitude,
              longitude,
              distance,
              sortValue: 'googleRating',
              sortDirection: 'desc',
            },
          });

          const nearbyLocationsWithDistance = response.data
            .map((location) => ({
              ...location,
              distanceInMeters: Math.round(location.distance * 1000),
            }))
            .filter((location) => location.distanceInMeters > 0);

          setNearbyLocations(nearbyLocationsWithDistance);
        } catch (error) {
          console.error('Error fetching nearby locations:', error);
        }
      };

      fetchNearbyLocations();
    }
  }, [latitude, longitude, distance]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!location) {
    return <div>No details available for this location.</div>;
  }

  return (
    <div className="attraction-detail-container">
      <h2>{location.locationName}</h2>
      <h3>{location.regionName}</h3>
      <img src={location.placeImgUrl} alt={location.locationName} />
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
          {nearbyLocations.slice(0, 4).map((nearbyLocation) => (
            <li key={nearbyLocation.locationId} className="nearby-location-item">
              <Link to={`/attractionDetail/${nearbyLocation.locationId}`} className="nearby-link">
                <img src={nearbyLocation.placeImgUrl} alt={nearbyLocation.locationName} />
                <h4>{nearbyLocation.locationName}</h4>
                <p>{nearbyLocation.regionName}</p>
                <p>별점 : {nearbyLocation.googleRating}</p>
                <p className="description">
                  {nearbyLocation.description.length > 50
                    ? `${nearbyLocation.description.substring(0, 50)}...`
                    : nearbyLocation.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>근처에 다른 장소가 없습니다.</p>
      )}
    </div>
  );
};

export default AttractionDetail;
