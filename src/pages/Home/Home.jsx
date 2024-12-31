import React, { useEffect, useState } from "react";
import "./Home.css";
import Card from "../../component/Card";
import TokyoTower from "../../img/TokyoTower.jpg";
import OsakaCastle from "../../img/OsakaCastle.jpg";
import FukuokaTower from "../../img/FukuokaTower.jpg";
import Sensoji from "../../img/Sensoji.jpg";
import map from "../../img/map.png";
import Harajuku from "../../img/Harajuku.png";
import Dotonbori from "../../img/Dotonbori.jpg";
import FushimiInariShrine from "../../img/FushimiInariShrine.jpg";
import MainBanner from "../../img/MainBanner.jpg";
import SecondBanner from "../../img/SecondBanner.jpg";
import ThirdBanner from "../../img/ThirdBanner.jpg";
import axios from "axios";

import { Swiper, SwiperSlide } from "swiper/react"; // 슬라이더 불러오기
// Swiper 모듈 가져오기
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";

import "swiper/css/navigation";
import "swiper/css/pagination";

// AOS 불러오기
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]); // 추천 데이터를 저장할 상태
  const [title, setTitle] = useState(); // 제목 상태

  // AOS 초기화 및 axios 요청
  useEffect(() => {
    // AOS 초기화
    AOS.init({
      duration: 1000, // 애니메이션 지속 시간
    });

    const token = localStorage.getItem("accessToken"); // JWT 토큰 가져오기

    const headers = token ? { Authorization: `Bearer ${token}` } : {}; // 비로그인 상태에서는 헤더 없이 요청

    axios
      .post("http://localhost:5050/api/ai/verify", {}, { headers })
      .then((response) => {
        console.log("Recommendations", response.data);
        setRecommendations(response.data);

        // 제목 설정
        if (token && response.data.length > 0) {
          setTitle("AI 추천 여행지");
        } else {
          setTitle("Google 평점이 높은 추천 여행지");
        }
      })
      .catch((err) => {
        console.error("Error fetching recommendations:", err);
        setTitle("추천 데이터를 불러오지 못했습니다.");
      });
  }, []);
  return (
    <div className="Home">
      <div className="slide">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          loop={true}
          speed={1500}
          className="slide"
        >
          <SwiperSlide className="slide-item">
            <div
              className="slide-content"
              style={{ backgroundImage: `url(${MainBanner})` }}
            >
              <a href="#">
                <span>
                  {" "}
                  떠나고 싶은 그 순간, 일본의 하늘 아래에서 새로운 이야기를
                  시작하세요.
                </span>
              </a>
            </div>
          </SwiperSlide>
          <SwiperSlide className="slide-item">
            <div
              className="slide-content"
              style={{ backgroundImage: `url(${SecondBanner})` }}
            >
              <a href="#">
                <span>
                  환상적인 밤 벚꽃길, 마음을 밝히는 등불 아래에서 추억을
                  만드세요.
                </span>
              </a>
            </div>
          </SwiperSlide>
          <SwiperSlide className="slide-item">
            <div
              className="slide-content"
              style={{ backgroundImage: `url(${ThirdBanner})` }}
            >
              <a href="#">
                <span>
                  분홍빛 벚꽃과 도쿄의 불빛, 잊지 못할 봄의 풍경이 펼쳐집니다.
                </span>
              </a>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <div className="section">
        <div className="search">
          <h3>어디로 가시나요?</h3>
          <input
            type="text"
            placeholder="여행지를 검색하세요"
            className="search-bar"
          />
        </div>

        <section className="recommended" data-aos="fade-up">
          <h3>{title}</h3>
          <div className="card-container">
            {recommendations.map((location, index) => (
              <div
                key={index}
                className="card"
                onClick={() =>
                  navigate(`/attractionDetail/${location.locationId}`, {})
                }
              >
                <Card
                  image={location.placeImgUrl || ""} // 이미지 URL
                  title={location.locationName || "장소 이름 없음"} // 장소 이름
                  location={location.regionName || "지역 정보 없음"} // 지역 이름
                  rating={`Google 평점: ${location.googleRating || "N/A"}`} // 평점
                  description={location.description || "설명이 없습니다."} // 설명
                />
              </div>
            ))}
          </div>
        </section>

        {/* 카테고리 섹션 */}
        <section className="category" data-aos="fade-up">
          <h3>카테고리 탐색</h3>
          <span>
            다양한 테마로 분류된 여행지를 탐색하며 새로운 경험을 만나보세요.
          </span>
          <div className="category-container">
            <div className="category-card-large">
              <div className="category-title">관광명소</div>
            </div>
            <div className="small-cards-container">
              <div className="category-card">
                <div className="category-title">음식</div>
              </div>
              <div className="category-card">
                <div className="category-title">랜드마크</div>
              </div>
              <div className="category-card">
                <div className="category-title">문화</div>
              </div>
              <div className="category-card">
                <div className="category-title">쇼핑</div>
              </div>
            </div>
          </div>
        </section>

        <section className="map-section" data-aos="fade-up">
          <h3>여행 계획</h3>
          <span>나만의 특별한 여행을 계획하고 완성해 보세요.</span>
          <div className="travel-plan-container">
            <div className="travel-plan">
              <h4 className="plan-title">내 여행 코스 일정</h4>
              <div className="plan-dayAll">
                <div className="plan-day">
                  <h5>1일차</h5>
                  <ul>
                    <li>
                      <span className="landmark-tag">랜드마크</span> 도쿄 타워
                      <br />
                      <span>13:00 - 15:00</span>
                    </li>
                    <li>
                      <span className="landmark-tag">랜드마크</span> 센소지
                      <br />
                      <span>15:30 - 17:00</span>
                    </li>
                    <li>
                      <span className="landmark-tag">랜드마크</span> 오사카 성
                      <br />
                      <span>18:00 - 20:00</span>
                    </li>
                  </ul>
                </div>
                <div className="plan-day">
                  <h5>2일차</h5>
                  <ul>
                    <li>
                      <span className="landmark-tag">랜드마크</span> 교토 사원
                      <br />
                      <span>13:00 - 15:00</span>
                    </li>
                    <li>
                      <span className="landmark-tag">랜드마크</span> 도쿄 타워
                      <br />
                      <span>15:30 - 17:00</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="map-container">
              <img src={map} alt="Map Placeholder" className="map-image" />
            </div>
          </div>
          <button
            className="start-button"
            onClick={() => navigate(`/plan`, {})}
          >
            시작하기
          </button>
        </section>
      </div>
      <section className="reviews">
        <div className="innerWrap">
          <div className="review-title-container">
            <h3 className="title">사용자 리뷰</h3>
            <span className="subheading">
              진짜 여행자들의 생생한 리뷰를 확인해 보세요.
            </span>
          </div>
          <div className="review-card-container">
            <div className="review-card" data-aos="fade-up">
              <img
                src={Harajuku}
                alt="도쿄 하라주쿠"
                className="review-image"
              />
              <div className="review-content">
                <h4>도쿄 하라주쿠</h4>
                <p>⭐⭐⭐⭐⭐</p>
                <p>
                  <strong>무조건 강추!</strong>
                </p>
                <p>
                  젊음의 문화와 패션의 중심지인 하라주쿠는
                  <br />
                  독특한 거리 음식과 개성 넘치는 상점들로 가득 차 있어, 다양한
                  문화를 체험하고자 하는
                  <br />
                  여행자들에게 추천합니다.
                </p>
                <span>므째이 성완</span>
              </div>
            </div>

            <div className="review-card" data-aos="fade-up">
              <img
                src={Dotonbori}
                alt="오사카 도톤보리"
                className="review-image"
              />
              <div className="review-content">
                <h4>오사카 도톤보리</h4>
                <p>⭐⭐⭐⭐⭐</p>
                <p>
                  <strong>연인이랑 가보세요!!</strong>
                </p>
                <p>
                  화려한 네온사인과 다양한 먹거리로 가득한 오사카 도톤보리는 꼭
                  방문해야 할 명소입니다. 특히 밤에 보는 도톤보리는 화려한
                  불빛이 매력을 더해줘 연인이랑 가는걸 추천!
                </p>
                <span>므째이 재영</span>
              </div>
            </div>

            <div className="review-card" data-aos="fade-up">
              <img
                src={FushimiInariShrine}
                alt="후시미 이나리 신사"
                className="review-image"
              />
              <div className="review-content">
                <h4>교토 후시미 이나리 신사</h4>
                <p>⭐⭐⭐⭐⭐</p>
                <p>
                  <strong>신비로움을 겪고 싶으면 여기로~</strong>
                </p>
                <p>
                  수천 개의 붉은 토리이 문이 이어진 후시미 이나리 신사는
                  신비로움이 가득한 장소인데요, 토리이 문을 따라 산책하며 마치
                  다른 세계에 온 듯한 느낌을 받을 수 있어요. 일몰 무렵에는 붉은
                  토리이 문 사이로 비치는 빛이 환상적이에요!
                </p>
                <span>므째이 재용</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*<section className="footer">*/}
      {/*    <div className="footer-content">*/}
      {/*        <h2 className="footer-logo">LOGO</h2>*/}
      {/*        <p className="footer-contact">Contact to : ssw123c@gmail.com<br/>*/}
      {/*            위 웹페이지는 비상업적 포트폴리오 목적으로 제작된 사이트입니다.*/}
      {/*        </p>*/}

      {/*        <div className="footer-links">*/}
      {/*            <a href="#terms">이용약관</a> |*/}
      {/*            <a href="#privacy"> 개인정보처리방침</a> |*/}
      {/*            <a href="#copyright"> 저작권정책</a> |*/}
      {/*            <a href="#reject"> 이메일주소무단수집거부</a> |*/}
      {/*            <a href="#sitemap"> 사이트맵</a>*/}
      {/*        </div>*/}
      {/*    </div>*/}
      {/*    <div className="footer-icons">*/}
      {/*        <img src={youtube} alt="youtube"/>*/}
      {/*        <img src={instagram} alt="instagram"/>*/}
      {/*    </div>*/}
      {/*</section>*/}
    </div>
  );
}

export default Home;
