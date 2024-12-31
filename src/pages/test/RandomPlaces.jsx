import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RandomPlaces.css';
import { useContext } from 'react';
import { AuthContext } from '../../App';


const RandomPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [ratings, setRatings] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 5점 척도 텍스트
  const ratingOptions = [
    { value: 1, label: "별로" },
    { value: 2, label: "보통 이하" },
    { value: 3, label: "보통" },
    { value: 4, label: "좋음" },
    { value: 5, label: "매우 좋음" },
  ];

  // useEffect(() => {
  //   setLoading(true);
  //   axios
  //       .get('http://localhost:5050/api/ai/random-places')
  //       .then((response) => {
  //         setPlaces(response.data);
  //         setLoading(false);
  //         setIsModalOpen(true); // 데이터 로드 후 모달 열기
  //       })
  //       .catch((error) => {
  //         console.error('Error fetching random places:', error);
  //         setError('관광지 데이터를 불러오는 데 실패했습니다.');
  //         setLoading(false);
  //       });
  // }, []);

    // useContext를 useEffect 외부로 이동
    const { user } = useContext(AuthContext);

  useEffect(() => {
    console.log("Loading RandomPlaces data...");
    setLoading(true);
    axios
        .get(`http://localhost:5050/api/ai/random-places?email=${user.email}`)
        .then((response) => {
          console.log("Fetched places:", response.data);
          setPlaces(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching random places:", error);
          setError("관광지 데이터를 불러오는 데 실패했습니다.");
          setLoading(false);
        });
  }, [user]);


  const handleRatingChange = (locationId, value) => {
    setRatings({ ...ratings, [locationId]: value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (Object.keys(ratings).length < places.length) {
      alert('모든 관광지에 대한 점수를 입력해주세요.');
      return;
    }

    const payload = places.map((place) => ({
      locationId: place.locationId,
      rating: ratings[place.locationId] || 3, // 기본값: 보통
    }));

    try {
      await axios.post('http://localhost:5050/api/ai/rating', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage('점수가 성공적으로 제출되었습니다!');
    } catch (error) {
      console.error('점수 제출 실패:', error.response?.data || error.message);
      setMessage('점수 제출에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < places.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  if (loading) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const currentPlace = places[currentIndex];

  return (
      <div>
        {isModalOpen && (
            <div className="place-modal-overlay" onClick={closeModal}>
              <div className="place-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="place-modal-header">
                  <p> 사용자 맞춤 추천 </p>
                  <button className="place-close-button" onClick={closeModal}>X</button>
                </div>
                <div className="modal-body">
                  <h3>{currentPlace.locationName}</h3>
                  <p>{currentPlace.description}</p>
                  <div className="image-and-buttons">
                    <button
                        className="place-nav-button prev"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                    >
                      ◀
                    </button>
                    {currentPlace.placeImgUrl && (
                        <img
                            src={currentPlace.placeImgUrl}
                            alt={currentPlace.locationName}
                            className="place-image"
                        />
                    )}
                    <button
                        className="place-nav-button next"
                        onClick={handleNext}
                        disabled={currentIndex === places.length - 1}
                    >
                      ▶
                    </button>
                  </div>
                  <div className="place-bottom">
                  <p className="page-indicator">
                    {currentIndex + 1} / {places.length}
                  </p>
                  <div className="rating-buttons">
                    {ratingOptions.map((option) => (
                        <button
                            key={option.value}
                            className={`rating-button ${
                                ratings[currentPlace.locationId] === option.value ? "selected" : ""
                            }`}
                            onClick={() =>
                                handleRatingChange(currentPlace.locationId, option.value)
                            }
                        >
                          {option.label}
                        </button>
                    ))}
                  </div>
                  {currentIndex === places.length - 1 && (
                      <button className="places-button" onClick={handleSubmit}>
                        제출하기
                      </button>
                  )}
                    {message && <p className="message">{message}</p>}
                </div>
                </div>

              </div>
            </div>
        )}
      </div>
  );
};

export default RandomPlaces;
