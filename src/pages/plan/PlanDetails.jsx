import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PlanDetails = () => {
  const { id } = useParams(); // URL에서 id 가져오기
  const [planner, setPlanner] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 서버에서 ID로 플랜 정보 가져오기
    const fetchPlanDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/planner/${id}`
        );
        setPlanner(response.data); // 데이터 저장
      } catch (error) {
        console.error('플랜 불러오기 실패:', error);
      }
    };

    fetchPlanDetails();
  }, [id]);

  if (!planner) return <p>로딩 중...</p>;

  return (
    <div>
      <h2>{planner.plannerTitle}</h2>
      <p>시작 날짜: {planner.plannerStartDate}</p>
      <p>종료 날짜: {planner.plannerEndDate}</p>
      <p>지역: {planner.regionName}</p>
      {planner.dailyPlans.map((day, index) => (
        <div key={index}>
          <h3>{day.planDate}</h3>
          <ul>
            {day.toDos.map((todo, idx) => (
              <li key={idx}>
                {todo.locationName} - {todo.formattedAddress}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {/* PlannerList 페이지로 이동하는 버튼 */}
      <button onClick={() => navigate('/planner-list')}>
        플래너 목록으로 이동
      </button>
      {/* 수정 페이지로 이동 */}
      <button onClick={() => navigate(`/planner/edit/${id}`)}>
        플래너 수정하기
      </button>
    </div>
  );
};

export default PlanDetails;
