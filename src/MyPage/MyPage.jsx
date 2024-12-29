import React, { useContext, useState, useEffect  } from "react";
import { AuthContext } from "../App";
import "./MyPage.css";
import youtube from "../img/icons/youtube.png";
import instagram from "../img/icons/Instagram.png";
import axios from "axios";
import { Link } from 'react-router-dom';
import ReviewCreateModal from '../component/ReviewCreateModal';

const MyPage = () => {
    const { user } = useContext(AuthContext);
    const [activeOptions, setActiveOptions] = useState(null); // 활성화된 카드의 ID 저장
    const [activeTab, setActiveTab] = useState("plans"); // 기본적으로 '나의 여행 계획' 탭 활성화

    const toggleOptions = (id) => {
        console.log(id);
        console.log(activeOptions);
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

    // ⋮ 버튼 누르고 뜨는 메뉴 바깥을 눌렀을때 메뉴 사라지게
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 메뉴와 버튼 영역을 제외한 바깥 클릭인지 확인
            if (!event.target.closest(".myPage-review-options") &&
                !event.target.closest(".options-button")) 
            {
                setActiveOptions(null); // 메뉴 닫기
            }
        };
    
        // 전역 클릭 이벤트 등록
        document.addEventListener("click", handleClickOutside);
    
        // 컴포넌트 언마운트 시 이벤트 제거
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);



    // 리뷰조회입니다....
    const [reviews, setReviews] = useState([]); // 리뷰 상태
    const [reviewLocation, setReviewLocation] = useState([]); // 리뷰가 쓰인 장소 상태태
    const [totalReviews,setTotalReviews] = useState();  // 총 리뷰 갯수수
    const [currentPage, setCurrentPage] = useState(0);  // 현재 페이지
    const [totalPages, setTotalPages] = useState(0);  // 전체 페이지 수
    const [loading, setLoading] = useState(false); // 로딩 상태

    
    
    // 리뷰 데이터 API 호출
    const fetchReviews = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5050/reviews/getReviewsWithLocation", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                params: {
                    page: pageNumber, // 첫 번째 페이지
                    pageSize: 5, // 한 페이지당 5개 리뷰
                    sortValue: "reviewCreatedAt", // 리뷰 생성일 기준 정렬
                    sortDirection: "desc", // 내림차순
                },
            });
            
            if (response && response.data) {
                const reviewWithLocationDtoList =
                response.data._embedded?.reviewWithLocationDtoList || []; // 데이터가 없으면 빈 배열
                
                // 리뷰저장
                const reviewList = reviewWithLocationDtoList.map((item) => item.reviewDto);
                const reviewLocationList = reviewWithLocationDtoList.map((item) => item.locationDto);
                
                setReviews(reviewList);
                setReviewLocation(reviewLocationList);
                setTotalPages(response.data.page.totalPages); // 전체 페이지 수 저장
                setTotalReviews(response.data.page.totalElements); // 전체 리뷰 수 저장
                setCurrentPage(pageNumber); // 현재 페이지 업데이트
            }
        } catch (error) {
            console.error("리뷰 데이터를 가져오는 데 실패했습니다.",error);
        } finally {
            setLoading(false);
        }
    };
    
    // 컴포넌트가 처음 마운트될 때 리뷰 데이터를 가져옴
    useEffect(() => {
        fetchReviews(currentPage);
    }, [currentPage]);
    
    // 페이지 변경
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage); // 새 페이지로 업데이트
        }
    };
    
    // 탭 변경 시 데이터 fetch
    useEffect(() => {
        if (activeTab === "reviews") {
            fetchReviews(); // "나의 리뷰" 탭이 활성화되면 API 호출
        }
        if(activeTab === "favorites"){
            fetchFavoriteLocation(); // favoriteTab이 활성화되었을 때만 호출
        }
    }, [activeTab]);
    
    // 평점을 별로 표시하는 함수
    const renderStars = (rating) => {
        const filledStars = Math.floor(rating); // 꽉 찬 별 개수
        const emptyStars = 5 - filledStars; // 빈 별 개수
        
        const stars = [];
        for (let i = 0; i < filledStars; i++) {
            stars.push(<span key={`filled-${i}`} className="star filled">★</span>);
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
        }
        return stars;
    };

    // 리뷰 모달 상태 관리
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewMode,setReviewMode] = useState("view"); // 리뷰 작성 모달창의 mode 데이터
    const [initialData,setInitialData] = useState(null); // 리뷰 수정시 기존 리뷰 데이터

    // 리뷰 수정 모달 관련 상태
    const openReviewModal = (reviewData) => {
        setReviewMode("edit");  // 수정 모드로 설정
        setInitialData(reviewData);  // 수정할 리뷰 데이터 설정
        setIsReviewModalOpen(true);  // 모달 열기
    };
    
    const handleEditReviewSuccess = (status) => {
        if(status = "success"){
            // 수정된 리뷰 데이터 다시 불러오기 (새로고침 효과)
            fetchReviews(currentPage);
        }
    };

    // 리뷰 삭제 요청
    const handleDeleteReview = async (reviewId) => {

        const confirmDelete = window.confirm("정말로 이 리뷰를 삭제하시겠습니까?");
        if(confirmDelete){
            try {
                await axios.delete(`http://localhost:5050/reviews/delete/${reviewId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });

                alert("리뷰가 삭제되었습니다.");
                // 삭제된 후 리뷰 목록을 다시 불러옴.
                fetchReviews(currentPage);
            } catch (error) {
                console.error("리뷰 삭제에 실패했습니다.", error);
                alert("리뷰 삭제에 실패했습니다.");
            }
        }
    };


    const [favoriteLocations, setFavoriteLocations] = useState([]);

    const fetchFavoriteLocation = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5050/api/locationFavorite/userFavorites", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                params: {
                    page: pageNumber,
                    pageSize: 100,
                    sortValue: 'createdAt',
                    sortDirection: 'ASC',
                },
            });
            console.log(response);
            setFavoriteLocations(response.data.content); // 받아온 데이터로 상태 업데이트
        } catch (error) {
            console.error("즐겨찾기 목록 조회 실패", error);
        } finally {
            setLoading(false);
        }
    };
    
    
    
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
                        <button>나의 리뷰 {totalReviews}</button>
                        <button>찜한 여행지 1</button>
                    </div>
                </div>
            </header>

            <nav className="mypage-tabs">

                <button
                    className={activeTab === "plans" ? "active" : ""}
                    onClick={() => setActiveTab("plans")}
                >
                    나의 여행 계획 2
                </button>

                <button
                    className={activeTab === "reviews" ? "active" : ""}
                    onClick={() => setActiveTab("reviews")}
                >
                    나의 리뷰 {totalReviews}
                </button>
                <button 
                    className={activeTab === "favorites" ? "active" : ""}
                    onClick={() => setActiveTab("favorites")}
                >
                    찜한 여행지
                </button>

            </nav>

            <div className="mypage-content">
                {activeTab === "plans" && (
                    <>
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
                    </>
                )}

                {activeTab === "reviews" && (
                    <>
                        {loading && <p>로딩 중...</p>}
                        {!loading && reviews.length === 0 && <p>작성한 리뷰가 없습니다.</p>}

                        <div className="myPage-reviews">
                            {reviews.map((review, index) => (
                            <div key={review.reviewId} className="review-card">
                                <div className="myPage-review-header">
                                    <div className="myPage-review-header-left">
                                        <h3>{review.title}</h3>
                                        <div className="myPage-review-rating">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                    {/* 우측에 ⋮ 버튼 옵션 */}
                                    <div className="myPage-review-options">
                                        <button 
                                            className="myPage-review-options-button"
                                            onClick={() => toggleOptions(review.reviewId)}
                                            >
                                                ⋮
                                            </button>
                                        {/* 옵션 메뉴가 열리면 수정 및 삭제 버튼 표시 */}
                                        {activeOptions === review.reviewId && (
                                            <div className="myPage-review-options-menu">
                                                <button onClick={() => openReviewModal(review)}>수정</button>
                                                <button onClick={() => handleDeleteReview(review.reviewId)}>삭제</button>
                                            </div>
                                        )}
                                    </div>
                                </div>


                                <p>{review.comment}</p>

                                {/* 리뷰 이미지 */}
                                <div className="myPage-review-images">
                                    {review.imageUrls && review.imageUrls.length > 0 && (
                                        review.imageUrls.map((imageUrl, idx) => (
                                            <img
                                                key={idx}
                                                src={imageUrl}
                                                alt={`review-image-${idx}`}
                                                className="myPage-review-image"
                                            />
                                        ))
                                    )}
                                </div>

                                <div className="myPage-review-location">
                                    <div className="myPage-review-location-info">
                                        {/* 위치 이미지가 있을 경우 표시 */}
                                        {reviewLocation[index]?.placeImgUrl && (
                                            <Link to={`/attractionDetail/${reviewLocation[index].locationId}`}>
                                            <img
                                                src={reviewLocation[index].placeImgUrl}
                                                alt={reviewLocation[index].locationName}
                                                className="myPage-review-location-image"
                                            />
                                            </Link>
                                        )}
                                        <Link to={`/attractionDetail/${reviewLocation[index]?.locationId}`}>
                                            <span>{reviewLocation[index]?.locationName || '알 수 없음'}</span>
                                        </Link>
                                    </div>
                                </div>
                                {/* 리뷰 수정 모달 */}
                                {isReviewModalOpen && (
                                    <ReviewCreateModal
                                        mode={reviewMode} // 'edit' 모드로 설정
                                        initialData={initialData} // 수정할 기존 리뷰 데이터 전달
                                        locationId={reviewLocation[index].locationId}
                                        onClose={() => setIsReviewModalOpen(false)} // 모달 닫기
                                        onSuccess={handleEditReviewSuccess} // 수정 성공 시 호출
                                    />
                                )}
                            </div>
                            ))}

                        </div>

                        <div className="myPage-review-pagination">
                            <button
                            disabled={currentPage <= 0}
                            onClick={() => handlePageChange(currentPage - 1)}
                            >
                                이전
                            </button>
                            <span>{currentPage + 1} / {totalPages}</span>
                            <button
                            disabled={currentPage >= totalPages - 1}
                            onClick={() => handlePageChange(currentPage + 1)}
                            >
                            다음
                            </button>
                        </div>

                    </>
                )}

                {activeTab === "favorites" && (
                    <>
                        <p>찜한 여행지 목록</p>
                        {loading ? (
                            <p>로딩 중...</p>
                        ) : (
                            favoriteLocations.map((destination) => (
                                <div key={destination.locationId} className="favorite-destination-card">
                                    <img src={destination.placeImgUrl} alt={destination.locationName} />
                                    <h3>{destination.locationName}</h3>
                                    <p>평점: {destination.googleRating} ({destination.userRatingsTotal}명 평가)</p>
                                    <p>주소: {destination.formattedAddress}</p>
                                    <a href={destination.website} target="_blank" rel="noopener noreferrer">
                                        공식 웹사이트
                                    </a>
                                </div>
                            ))
                        )}
                    </>
                )}


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
