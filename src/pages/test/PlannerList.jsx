import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./PlannerList.css";
import Tokyo from '../../img/Tokyo.jpg';
import Osaka from '../../img/Osaka.jpg';
import KyotoCity from '../../img/KyotoCity.jpg';
import Fukuoka from '../../img/Fukuoka.jpg';
import planListImg from '../../img/planListImg.jpg';

const PlannerList = () => {
  const [planners, setPlanners] = useState([]);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("전체");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlanners = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          setError("로그인이 필요합니다.");
          return;
        }

        const response = await axios.get(
            "http://localhost:5050/api/planner/user/plans",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );

        const updatedPlanners = response.data.map((planner) => {
          return {
            ...planner,
            imageUrl: getCityImage(planner.plannerTitle),
            city: getCityCategory(planner.plannerTitle),
            days: calculateDays(planner.plannerStartDate, planner.plannerEndDate),
          };
        });

        setPlanners(updatedPlanners);
      } catch (err) {
        console.error("플래너 데이터를 가져오는 데 실패:", err);
        setError("플래너 데이터를 불러오지 못했습니다.");
      }
    };

    fetchPlanners();
  }, []);

  const getCityImage = (title) => {
    if (title.includes("오사카")) return Osaka;
    if (title.includes("도쿄")) return Tokyo;
    if (title.includes("교토")) return KyotoCity;
    if (title.includes("후쿠오카")) return Fukuoka;
    return "https://via.placeholder.com/150";
  };

  const getCityCategory = (title) => {
    if (title.includes("오사카")) return "오사카";
    if (title.includes("도쿄")) return "도쿄";
    if (title.includes("교토")) return "교토";
    if (title.includes("후쿠오카")) return "후쿠오카";
    return "기타";
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return `${difference}박 ${difference + 1}일`;
  };

  const filteredPlanners =
      category === "전체"
          ? planners
          : planners.filter((planner) => planner.city === category);

  const handleDeletePlanner = async (plannerId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost:5050/api/planner/${plannerId}`);

      setPlanners((prev) =>
          prev.filter((planner) => planner.plannerId !== plannerId)
      );
      alert("플래너가 삭제되었습니다.");
    } catch (err) {
      alert("플래너 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
      <div className="planner-list">
        <div className="planner-List-title">
          <img src={planListImg} alt="planListImg" className="planListImg"/>
          <h1 className="planner-list-title">나만의 여행 플래너</h1>
        </div>
        <div className="small-title">
          <h2>여행목록</h2>
          {error && <p className="error">{error}</p>}
        </div>
        <div className="planner-cards">
          {filteredPlanners.map((planner) => (
              <div className="planner-card-horizontal" key={planner.plannerId}>
                <button
                    className="delete-button"
                    onClick={() => handleDeletePlanner(planner.plannerId)}
                >
                  ×
                </button>
                <div className="planner-card-image">
                  <img src={planner.imageUrl} alt={planner.plannerTitle} />
                </div>
                <div className="planner-card-content">
                  <h3 className="planner-card-title">{planner.plannerTitle}</h3>
                  <p>{planner.city}</p>
                  <p>{planner.days}</p>
                  <p>여행 일정 | {planner.plannerStartDate} ~ {planner.plannerEndDate}</p>
                  <button
                      className="view-button"
                      onClick={() => navigate(`/view-plan/${planner.plannerId}`)}
                  >
                    상세 보기
                  </button>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default PlannerList;
