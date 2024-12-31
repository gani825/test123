import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RandomPlaces.css'; // CSS 파일 연결
const RandomPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [ratings, setRatings] = useState({});
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    setLoading(true); // 로딩 시작
    axios
      .get('http://localhost:5050/api/ai/random-places')
      .then((response) => {
        setPlaces(response.data);
        setLoading(false); // 로딩 종료
      })
      .catch((error) => {
        console.error('Error fetching random places:', error);
        setError('관광지 데이터를 불러오는 데 실패했습니다.');
        setLoading(false); // 로딩 종료
      });
  }, []);

  const handleRatingChange = (locationId, value) => {
    setRatings({ ...ratings, [locationId]: value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken'); // JWT 토큰 가져오기

    if (!token) {
      console.error('JWT 토큰이 없습니다.');
      alert('로그인이 필요합니다.');
      return;
    }

    if (Object.keys(ratings).length < places.length) {
      alert('모든 관광지에 대한 점수를 입력해주세요.');
      return;
    }

    const payload = places.map((place) => ({
      locationId: place.locationId,
      rating: ratings[place.locationId] || 3, // 점수
    }));

    try {
      await axios.post('http://localhost:5050/api/ai/rating', payload, {
        headers: {
          Authorization: `Bearer ${token}`, // JWT 포함
        },
      });
      console.log('점수 제출 완료:', payload);

      setMessage('점수가 성공적으로 제출되었습니다!');
    } catch (error) {
      console.error('점수 제출 실패:', error.response?.data || error.message);
      setMessage('점수 제출에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return <div>데이터를 불러오는 중입니다...</div>; // 로딩 표시
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="random-places-container">
      <h1>추천 관광지</h1>
      <ul className="places-list">
        {places.map((place) => (
          <li key={place.locationId}>
            <h2>{place.locationName}</h2>
            <p>{place.description}</p>
            {place.placeImgUrl && (
              <img src={place.placeImgUrl} alt={place.locationName} />
            )}
            <div className="rating-container">
              <label htmlFor={`rating-${place.locationId}`}>점수:</label>
              <input
                type="range"
                id={`rating-${place.locationId}`}
                min="1"
                max="5"
                step="1"
                value={ratings[place.locationId] || 3}
                onChange={(e) =>
                  handleRatingChange(place.locationId, parseInt(e.target.value))
                }
              />
              <span>{ratings[place.locationId] || 3}</span>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit}>점수 제출</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default RandomPlaces;
