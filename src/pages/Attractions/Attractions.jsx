import React, { useState } from 'react';
import './Attractions.css';  // CSS import

// 카테고리 목록
const categories = [
    '놀이공원', '관광 명소', '박물관', '흥미로운 장소', '공원', '쇼핑몰', '미술관',
    '종교적 장소', '스타디움', '동물원', '도서관', '수족관', '체육관', '자연 명소'
  ];
  
  const Attractions = () => {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
  
    // 버튼 클릭 처리 (이벤트 핸들러)
    const handleButtonClick = (category) => {
      setSelectedCategories((prev) => {
        if (prev.includes(category)) {
          return prev.filter((item) => item !== category);
        }
        if (prev.length < 3) {
          return [...prev, category];
        }
        return prev;
      });
    };
  
    // 검색어 변경 처리 (이벤트 핸들러)
    const handleSearchChange = (event) => {
      setSearchTerm(event.target.value);
    };
  
    return (
      <div className="container">
        {/* 검색창 */}
        <input
          type="text"
          className="search-input"
          placeholder="관광지 검색"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        
        <h4>관심 있는 카테고리 선택 (최대 3개)</h4>
        <div className="button-container">
          {categories.map((category) => (
            <button
              key={category}
              className={`button ${selectedCategories.includes(category) ? 'selected' : ''}`}
              onClick={() => handleButtonClick(category)}
              disabled={selectedCategories.length >= 3 && !selectedCategories.includes(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    );
  };

export default Attractions;
