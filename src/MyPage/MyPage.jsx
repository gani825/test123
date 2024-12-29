import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../App';
import './MyPage.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ReviewCreateModal from '../component/ReviewCreateModal';

const MyPage = () => {
  const { user } = useContext(AuthContext);
  const [activeOptions, setActiveOptions] = useState(null); // 활성화된 카드의 ID 저장
  const [activeTab, setActiveTab] = useState('plans'); // 기본적으로 '나의 여행 계획' 탭 활성화
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleOptions = (id) => {
    console.log(id);
    console.log(activeOptions);
    setActiveOptions((prev) => (prev === id ? null : id)); // 같은 ID 클릭 시 닫기
  };

  // ⋮ 버튼 누르고 뜨는 메뉴 바깥을 눌렀을때 메뉴 사라지게
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 메뉴와 버튼 영역을 제외한 바깥 클릭인지 확인
      if (
        !event.target.closest('.myPage-review-options') &&
        !event.target.closest('.options-button')
      ) {
        setActiveOptions(null); // 메뉴 닫기
      }
    };

    // 전역 클릭 이벤트 등록
    document.addEventListener('click', handleClickOutside);

    // 컴포넌트 언마운트 시 이벤트 제거
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // 리뷰조회입니다....
  const [reviews, setReviews] = useState([]); // 리뷰 상태
  const [reviewLocation, setReviewLocation] = useState([]); // 리뷰가 쓰인 장소 상태
  const [totalReviews, setTotalReviews] = useState(); // 총 리뷰 갯수수
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [loading, setLoading] = useState(false); // 로딩 상태

  // 리뷰 데이터 API 호출
  const fetchReviews = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:5050/reviews/getReviewsWithLocation',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          params: {
            page: pageNumber, // 첫 번째 페이지
            pageSize: 5, // 한 페이지당 5개 리뷰
            sortValue: 'reviewCreatedAt', // 리뷰 생성일 기준 정렬
            sortDirection: 'desc', // 내림차순
          },
        }
      );

      if (response && response.data) {
        const reviewWithLocationDtoList =
          response.data._embedded?.reviewWithLocationDtoList || []; // 데이터가 없으면 빈 배열

        // 리뷰저장
        const reviewList = reviewWithLocationDtoList.map(
          (item) => item.reviewDto
        );
        const reviewLocationList = reviewWithLocationDtoList.map(
          (item) => item.locationDto
        );

        setReviews(reviewList);
        setReviewLocation(reviewLocationList);
        setTotalPages(response.data.page.totalPages); // 전체 페이지 수 저장
        setTotalReviews(response.data.page.totalElements); // 전체 리뷰 수 저장
        setCurrentPage(pageNumber); // 현재 페이지 업데이트
      }
    } catch (error) {
      console.error('리뷰 데이터를 가져오는 데 실패했습니다.', error);
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
    if (activeTab === 'reviews') {
      fetchReviews(); // "나의 리뷰" 탭이 활성화되면 API 호출
    }
  }, [activeTab]);

  // 평점을 별로 표시하는 함수
  const renderStars = (rating) => {
    const filledStars = Math.floor(rating); // 꽉 찬 별 개수
    const emptyStars = 5 - filledStars; // 빈 별 개수

    const stars = [];
    for (let i = 0; i < filledStars; i++) {
      stars.push(
        <span key={`filled-${i}`} className="star filled">
          ★
        </span>
      );
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">
          ☆
        </span>
      );
    }
    return stars;
  };

  /*날짜 포맷팅 함수*/
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // 여행 계획 데이터 가져오기
    const fetchPlans = async () => {
      setLoading(true); // 로딩 시작
      try {
        const token = localStorage.getItem('accessToken');

        if (!token) {
          setError('로그인이 필요합니다.');
          return;
        }

        const response = await axios.get(
          'http://localhost:5050/api/planner/user/plans',
          {
            headers: {
              Authorization: `Bearer ${token}`, // 토큰 포함
            },
          }
        );

        if (response.data) {
          const updatedPlans = response.data.map((plan) => {
            const startDate = new Date(plan.plannerStartDate);
            const endDate = new Date(plan.plannerEndDate);
            const days = Math.ceil(
              (endDate - startDate) / (1000 * 60 * 60 * 24)
            );

            // 첫 번째 이미지 가져오기
            const firstImage =
              plan.dailyPlans[0]?.toDos[0]?.placeImgUrl ||
              'https://via.placeholder.com/100';

            return {
              ...plan,
              duration: `${days}박 ${days + 1}일`,
              imageUrl: firstImage, // 첫 번째 이미지 설정
              city: plan.regionName || '알 수 없음',
            };
          });
          setPlans(updatedPlans); // 플래너 데이터 설정
        }
      } catch (err) {
        console.error('여행 계획 데이터를 가져오는 데 실패했습니다:', err);
        setError('여행 계획 데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchPlans();
  }, []);

  // 리뷰 모달 상태 관리
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState('view'); // 리뷰 작성 모달창의 mode 데이터
  const [initialData, setInitialData] = useState(null); // 리뷰 수정시 기존 리뷰 데이터

  // 리뷰 수정 모달 관련 상태
  const openReviewModal = (reviewData) => {
    setReviewMode('edit'); // 수정 모드로 설정
    setInitialData(reviewData); // 수정할 리뷰 데이터 설정
    setIsReviewModalOpen(true); // 모달 열기
  };

  const handleEditReviewSuccess = (status) => {
    if ((status = 'success')) {
      // 수정된 리뷰 데이터 다시 불러오기 (새로고침 효과)
      fetchReviews(currentPage);
    }
  };

  // 리뷰 삭제 요청
  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm('정말로 이 리뷰를 삭제하시겠습니까?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5050/reviews/delete/${reviewId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        alert('리뷰가 삭제되었습니다.');
        // 삭제된 후 리뷰 목록을 다시 불러옴.
        fetchReviews(currentPage);
      } catch (error) {
        console.error('리뷰 삭제에 실패했습니다.', error);
        alert('리뷰 삭제에 실패했습니다.');
      }
    }
  };

  // const toggleOptions = (id) => {
  //     setActiveOptions((prev) => (prev === id ? null : id)); // 같은 ID 클릭 시 닫기
  // };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest('.options-menu') &&
        !event.target.closest('.options-button')
      ) {
        setActiveOptions(null); // 메뉴 닫기
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  const handleDeletePlan = async (plannerId) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      await axios.delete(`http://localhost:5050/api/planner/${plannerId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // 토큰 포함
        },
      });

      setPlans((prevPlans) =>
        prevPlans.filter((plan) => plan.plannerId !== plannerId)
      );
      alert('플래너가 삭제되었습니다.');
    } catch (error) {
      console.error('플래너 삭제 실패:', error);
      alert('플래너 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="mypage-container">
      <header className="mypage-header">
        <img
          src={user?.profilePicture || 'https://via.placeholder.com/100'}
          alt="Profile"
          className="profile-img"
        />
        <div className="profile-info">
          <div className="Profile">
            <strong>반가워요! {user?.displayName || 'OOO'}님</strong>
            <button className="Profile-button">프로필 설정⚙️</button>
          </div>
          <div className="navigation">
            <button className="active">나의 여행 계획 {plans.length}</button>
            <button>나의 리뷰 {totalReviews}</button>
            <button>찜한 여행지 1</button>
          </div>
        </div>
      </header>

      <nav className="mypage-tabs">
        <button
          className={activeTab === 'plans' ? 'active' : ''}
          onClick={() => setActiveTab('plans')}
        >
          나의 여행 계획 {plans.length}
        </button>

        <button
          className={activeTab === 'reviews' ? 'active' : ''}
          onClick={() => setActiveTab('reviews')}
        >
          나의 리뷰 {totalReviews}
        </button>

        <button>찜한 여행지 1</button>
      </nav>

      <div className="mypage-content">
        {activeTab === 'plans' && (
          <>
            <button className="add-plan" onClick={() => navigate(`/plan`, {})}>
              + 여행 일정 추가하기
            </button>
            {plans.length === 0 && <p>등록된 여행 계획이 없습니다.</p>}
            <div className="travel-plans">
              {plans.map((plan) => (
                <div key={plan.plannerId} className="travel-plan-card">
                  <img
                    src={plan.imageUrl || 'https://via.placeholder.com/100'}
                    alt={plan.plannerTitle}
                    className="travel-image"
                  />
                  <div className="travel-details">
                    <h3>{plan.plannerTitle}</h3>
                    <p>{plan.city || '알 수 없음'}</p>
                    <p>{plan.duration}</p>
                    <p>
                      여행 일정 | {plan.plannerStartDate} ~{' '}
                      {plan.plannerEndDate}
                    </p>
                  </div>
                  {/* 옵션 버튼 */}
                  <div className="options">
                    <button
                      className="options-button"
                      onClick={() => toggleOptions(plan.plannerId)}
                    >
                      ⋮
                    </button>
                    {activeOptions === plan.plannerId && ( // 해당 카드의 옵션만 표시
                      <div className="options-menu">
                        <button>공유하기</button>
                        <button>내용편집</button>
                        <button
                          onClick={() => handleDeletePlan(plan.plannerId)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'reviews' && (
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
                          <button onClick={() => openReviewModal(review)}>
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.reviewId)}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p>{review.comment}</p>

                  {/* 리뷰 이미지 */}
                  <div className="myPage-review-images">
                    {review.imageUrls &&
                      review.imageUrls.length > 0 &&
                      review.imageUrls.map((imageUrl, idx) => (
                        <img
                          key={idx}
                          src={imageUrl}
                          alt={`review-image-${idx}`}
                          className="myPage-review-image"
                        />
                      ))}
                  </div>

                  <div className="myPage-review-location">
                    <div className="myPage-review-location-info">
                      {/* 위치 이미지가 있을 경우 표시 */}
                      {reviewLocation[index]?.placeImgUrl && (
                        <Link
                          to={`/attractionDetail/${reviewLocation[index].locationId}`}
                        >
                          <img
                            src={reviewLocation[index].placeImgUrl}
                            alt={reviewLocation[index].locationName}
                            className="myPage-review-location-image"
                          />
                        </Link>
                      )}
                      <Link
                        to={`/attractionDetail/${reviewLocation[index]?.locationId}`}
                      >
                        <span>
                          {reviewLocation[index]?.locationName || '알 수 없음'}
                        </span>
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
              <span>
                {currentPage + 1} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                다음
              </button>
            </div>
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
