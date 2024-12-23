import React, { useState } from 'react';
import './Plan.css';
import CalendarModal from '../../component/CalendarModal'; // 달력 모달 컴포넌트 import
import Tokyo from '../../img/Tokyo.jpg';
import Osaka from '../../img/Osaka.jpg';
import KyotoCity from '../../img/KyotoCity.jpg';
import Fukuoka from '../../img/Fukuoka.jpg';

function Plan() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');

  const cities = [
    {
      id: 1,
      name: '도쿄',
      image: Tokyo,
      description: '도쿄는 현대와 전통이 공존하는 일본의 수도입니다.',
    },
    {
      id: 3,
      name: '오사카',
      image: Osaka,
      description: '오사카는 활기찬 거리와 먹거리로 유명합니다.',
    },
    {
      id: 4,
      name: '교토',
      image: KyotoCity,
      description: '교토는 아름다운 사찰과 정원이 가득한 도시입니다.',
    },
    {
      id: 2,
      name: '후쿠오카',
      image: Fukuoka,
      description: '후쿠오카는 역사적 명소와 현대가 어우러진 곳입니다.',
    },
  ];

  const openModal = (city) => {
    console.log('선택된 도시:', city);
    setSelectedCity({ name: city.name, id: city.id });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCity('');
  };

  return (
    <div className="choiceAll">
      <h2>떠날 여행지를 선택해보세요</h2>
      <div className="Choice">
        <div className="cityCards">
          {cities.map((city) => (
            <div
              key={city.id}
              className="cityCard"
              onClick={() => openModal(city)}
            >
              <img src={city.image} alt={city.name} className="City-img" />
              <span>{city.name}</span>
              <div className="tooltip">{city.description}</div>
            </div>
          ))}
        </div>
      </div>
      <CalendarModal
        show={showModal}
        onClose={closeModal}
        cityName={selectedCity.name}
        regionId={selectedCity.id}
      />
    </div>
  );
}

export default Plan;
