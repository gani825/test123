import React, { useContext, useState } from "react";
import { AuthContext } from "../App";
import "./MyPage.css";
import youtube from "../img/icons/youtube.png";
import instagram from "../img/icons/Instagram.png";

const MyPage = () => {
    const { user } = useContext(AuthContext);
    const [activeOptions, setActiveOptions] = useState(null); // 활성화된 카드의 ID 저장

    const toggleOptions = (id) => {
        setActiveOptions((prev) => (prev === id ? null : id)); // 같은 ID 클릭 시 닫기
    };

    const travelPlans = [
        {
            id: 1,
            title: "여행 이름",
            location: "도쿄",
            date: "2024-12-18 ~ 2024-12-19",
            image: "https://via.placeholder.com/100",
        },
        {
            id: 2,
            title: "여행 이름",
            location: "도쿄",
            date: "2024-12-18 ~ 2024-12-19",
            image: "https://via.placeholder.com/100",
        },
    ];

    return (
        <div className="mypage-container">
            <header className="mypage-header">
                <img
                    src={user?.profilePicture || "https://via.placeholder.com/100"}
                    alt="Profile"
                    className="profile-img"
                />
                <div className="profile-info">
                    <div className="Profile">
                    <strong>반가워요! {user?.displayName || "OOO"}님</strong>
                         <button className="Profile-button">프로필 설정⚙️</button>
                    </div>
                    <div className="navigation">
                        <button className="active">나의 여행 계획 2</button>
                        <button>나의 리뷰 1</button>
                        <button>찜한 여행지 1</button>
                    </div>
                </div>
            </header>

            <nav className="mypage-tabs">
                <button className="active">나의 여행 계획 2</button>
                <button>나의 리뷰 1</button>
                <button>찜한 여행지 1</button>
            </nav>

            <div className="mypage-content">
                <button className="add-plan">+ 여행 일정 추가하기</button>

                {travelPlans.map((plan) => (
                    <div className="travel-plan-card" key={plan.id}>
                        <img src={plan.image} alt={plan.title} className="travel-image"/>
                        <div className="travel-details">
                            <h3>{plan.title}</h3>
                            <p>{plan.location}</p>
                            <p>{plan.date}</p>
                        </div>
                        <div className="options">
                            <button
                                className="options-button"
                                onClick={() => toggleOptions(plan.id)}
                            >
                                ⋮
                            </button>
                            {activeOptions === plan.id && (
                                <div className="options-menu">
                                    <button>공유하기</button>
                                    <button>내용편집</button>
                                    <button>삭제</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/*<section className="footer">*/}
            {/*    <div className="footer-content">*/}
            {/*        <h2 className="footer-logo">LOGO</h2>*/}
            {/*        <p className="footer-contact">*/}
            {/*            Contact to : ssw123c@gmail.com*/}
            {/*            <br/>*/}
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
};

export default MyPage;
