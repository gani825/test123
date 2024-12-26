import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlannerList = () => {
  const [planners, setPlanners] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // 네비게이션 훅

  useEffect(() => {
    // 플래너 목록 가져오기
    const fetchPlanners = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5050/api/planner/user/plans'
        );
        setPlanners(response.data); // 플래너 데이터 저장
      } catch (err) {
        setError('플래너 데이터를 불러오지 못했습니다.');
      }
    };

    fetchPlanners();
  }, []);

  // 단일 조회 핸들러
  const handleViewDetails = (plannerId) => {
    navigate(`/view-plan/${plannerId}`); // ViewPlan 페이지로 이동
  };

  // 삭제 핸들러
  const handleDeletePlanner = async (plannerId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      console.log('삭제 요청 ID:', plannerId);
      await axios.delete(`http://localhost:5050/api/planner/${plannerId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setPlanners((prev) =>
        prev.filter((planner) => planner.plannerId !== plannerId)
      );
      alert('플래너가 삭제되었습니다.');
    } catch (err) {
      console.error('삭제 요청 실패:', err.response || err);
      alert('플래너 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <h1>플래너 목록</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {planners.map((planner) => (
          <li key={planner.plannerId} style={{ marginBottom: '10px' }}>
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => handleViewDetails(planner.plannerId)} // 단일 조회
            >
              {planner.plannerTitle} ({planner.plannerStartDate} ~{' '}
              {planner.plannerEndDate})
            </span>
            <button
              style={{ marginLeft: '10px', color: 'red' }}
              onClick={() => handleDeletePlanner(planner.plannerId)} // 삭제
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlannerList;
