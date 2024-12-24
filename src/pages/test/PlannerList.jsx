import React, { useEffect, useState } from "react";
import axios from "axios";

const PlannerList = () => {
  const [planners, setPlanners] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // 백엔드 API 호출
    const fetchPlanners = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5050/api/planner/user/plans"
        );
        setPlanners(response.data); // 플래너 데이터를 상태로 저장
      } catch (err) {
        setError("플래너 데이터를 불러오지 못했습니다.");
      }
    };

    fetchPlanners();
  }, []);

  return (
    <div>
      <h1>플래너 목록</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {planners.map((planner) => (
          <li key={planner.plannerId}>
            {planner.plannerTitle} ({planner.plannerStartDate} ~{" "}
            {planner.plannerEndDate})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlannerList;
