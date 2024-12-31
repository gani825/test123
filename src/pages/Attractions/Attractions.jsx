import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'
import { debounce } from 'lodash';
import { Link } from 'react-router-dom';
import './Attractions.css';  // CSS import
import starColor from '../../img/icons/starColor.png';
import angleDoubleSmallLeft from '../../img/icons/angleDoubleSmallLeft.png';
import angleDoubleSmallRight from '../../img/icons/angleDoubleSmallRight.png';
import angleSmallLeft from '../../img/icons/angleSmallLeft.png';
import angleSmallRight from '../../img/icons/angleSmallRight.png';
import heart from '../../img/icons/heart.png';
import heartFilled from '../../img/icons/heartFilled.png';

const Attractions = () => {
    const [regions, setRegions] = useState([]);  // 지역 목록
    const [selectedRegion, setSelectedRegion] = useState(null);  // 선택된 지역

    const [tags, setTags] = useState([]); // 태그 데이터를 저장할 상태
    const [selectedTags, setSelectedTags] = useState([]); // 선택된 태그

    const [searchTerm, setSearchTerm] = useState(''); // 검색어

    const [locations, setLocations] = useState([]);  // 페이지 데이터
    const [currentPage, setCurrentPage] = useState(0);  // 현재 페이지
    const [totalPages, setTotalPages] = useState(0);  // 전체 페이지 수
    const [totalElements, setTotalElements] = useState(0); // 총 여행지 개수

    const [likedLocations, setLikedLocations] = useState([]); // 좋아요 상태 관리

    const [loading, setLoading] = useState(false);  // 로딩 상태

    // 백엔드에서 지역정보(region) 가져옴
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await axios.get("http://localhost:5050/region/getAll");  // 지역 정보 API 호출

                setRegions(response.data);  // 가져온 지역 목록 데이터 저장
            } catch (error) {
                console.error('Error fetching regions:', error);
            }
        };
        fetchRegions();
    }, []);

    // 지역 선택 처리
    // const handleRegionChange = (event) => {
    //     setSelectedRegion(event.target.value);  // 선택된 지역 저장
    // };

    // 백엔드에서 Tag정보 가져옴
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axios.get("http://localhost:5050/tag/getAll"); // 모든 태그를 다 가져오는 API 경로

                setTags(response.data); // 가져온 데이터를 상태에 저장

            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };

        fetchTags();
    }, []);

    // 지역 버튼 클릭 처리
    const handleRegionClick = (regionId) => {
        setSelectedRegion((prev) => {
            const newRegion = prev === regionId ? null : regionId;
            handleSubmit(0, newRegion); // 지역 변경 시 데이터 바로 요청
            return newRegion;
        });
    };

    // 태그 버튼 클릭 처리
    const handleTagButtonClick = (tagId) => {
        setSelectedTags((prev) => {
            if (prev.includes(tagId)) {
                return prev.filter((id) => id !== tagId); // 이미 선택된 태그는 해제
            }
            if (prev.length < 3) {
                return [...prev, tagId];  // 최대 3개 선택 가능
            }
            return prev; // 3개 초과 시 선택 불가
        });
    };

    // 각종 데이터 (tag 정보, 검색어, 페이지 등)을 요청 파라미터에 담아 백엔드로 요청을 보내고 데이터를 받음
    const handleSubmit = async (pageNumber = 0, regionId = selectedRegion)=>{
        if (loading) return; // 중복 호출 방지
        setLoading(true);  // 데이터 요청 시작 시 로딩 상태 true로 설정

        try {
            const selectedTagNames = tags   // 선택된 태그들을 배열로 저장함
            .filter(tag => selectedTags.includes(tag.tagId)) // selectedTags에서 tagId와 일치하는 tag를 찾아
            .map(tag => tag.tagName)                         // 해당 tag들의 tagName을 추출

            const tagNamesString = selectedTagNames.join(',');  // 선택된 태그 배열을 ,를 이용하여 문자열로 변환

            // console.log('regionId:', regionId);

            const response = await axios.get("http://localhost:5050/api/locations/searchLocation",{ //
                params : {
                    regionId : regionId, // 현재 선택된 지역 ID
                    tagNames : tagNamesString,  // 선택된 Tag데이터
                    keyword : searchTerm,
                    page : pageNumber,  //현재 페이지 (0부터 시작함)
                    pageSize: 16,           // 페이지 크기 (한페이지에 몇개의 데이터를 나타낼것인지)
                    // sortValue: "userRatingsTotal",
                    // sortValue : 정렬 기준( "googleRating"와 같은 실수타입만 가능) - default googleRating기준
                    // sortDirection : 정렬 방향 ( "desc" (내림차순) 또는 "asc" (오름차순) ) - default desc기준
                }
            });

            // 서버에서 받은 응답을 처리
            if (response && response.data) {
                setLocations(response.data.content);   //지역정보 데이터 저장
                // console.log(response.data);
                setTotalPages(response.data.totalPages); // 전체 페이지 수 저장
                setCurrentPage(pageNumber)  // 현재 페이지가 어딘지 저장
                setTotalElements(response.data.totalElements); // 총 여행지 개수 저장
            } else {
                console.error("응답 데이터가 비어있습니다.");
            }

        } catch (error) {
            if (!loading) {
                // alert(error.response.data || '해당 지역에 대한 정보를 찾을 수 없습니다.'); // 장소 데이터가 없을 때 알림창
            }
            console.error('Error submitting selected tags:', error);

            // 에러 발생 시 선택한 태그, 검색어, 지역 초기화
            // setSelectedTags([]);  // 선택된 태그를 초기화
            setLocations([]);  // 지역 정보도 초기화
            // setSelectedRegion(null); // 선택된 지역 초기화
        } finally {
            setLoading(false); // 다 끝나면 로딩상태 false로 변경
        }
    };

    // 페이지가 처음 로드될 때, 태그나 검색어 없이 전체 로케이션 데이터를 요청
    useEffect(() => {
        handleSubmit(); // 초기 데이터 요청
    }, [selectedRegion]); // selectedRegion 변경 시 자동으로 요청

    const handlePageChange = (newPage) => {
        // 페이지 번호가 숫자여야만 처리하도록 확인
        if (typeof newPage === 'number' && !isNaN(newPage) && newPage >= 0 && newPage < totalPages) {
            handleSubmit(newPage);  // 새 페이지의 데이터 요청
        }
        // 페이지 상단으로 이동
        window.scrollTo({
            top: 0,
            // behavior: 'smooth', // 부드럽게 스크롤
        });
    };

    // 선택된 태그가 변경될 때마다 자동으로 결과 요청
    useEffect(() => {
        if (selectedTags.length > 0) {
            handleSubmit(); // 선택된 태그에 맞는 첫 번째 페이지 데이터 요청
        }
    }, [selectedTags]);

    // 검색어 변경 처리 (입력 후 버튼 클릭으로 전송)
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);  // 검색어를 상태에 저장
    };

    // 검색 버튼 클릭 처리
    const handleSearchSubmit = () => {
        handleSubmit(0); // 검색어로 첫 번째 페이지 데이터 요청
        setTotalElements(0); // 검색 결과 후 totalElements 비우기
    };

    // 페이지관련 설정
    const generatePageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;  // 보여줄 페이지의 최대 수
        let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));  // 시작 페이지 (현재 페이지 기준으로 앞쪽으로 최대 2개까지)
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);  // 끝 페이지 (현재 페이지 기준으로 뒤쪽으로 최대 2개까지)

        // 페이지 범위가 5개 미만일 때, 맨 뒤 페이지로 조정
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }

        // 페이지 번호 배열 생성
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    // 좋아요 아이콘 클릭 처리
    const handleLikeClick = (locationId) => {
        setLikedLocations((prevLikedLocations) => {
            if (prevLikedLocations.includes(locationId)) {
                // 이미 좋아요가 눌려 있다면, 좋아요 취소
                return prevLikedLocations.filter((id) => id !== locationId);
            } else {
                // 좋아요 추가
                return [...prevLikedLocations, locationId];
            }
        });
    };

    return (
        <div className="Attraction">
            <div className="title-container">
                <h2>관광지 및 여행시설</h2>
            </div>
            <div className="button-container">
                <h3>지역선택</h3>
                <div className="region-container">
                    {/*전체 버튼 추가 - 기본 선택*/}
                    <button
                        key={0}
                        className={`button ${selectedRegion === null ? 'selected' : ''}`}
                        onClick={() => handleRegionClick(null)}
                    >
                        전체
                    </button>
                    {regions.map((region) => (
                        <button
                            key={region.regionId}
                            className={`button ${selectedRegion === region.regionId ? 'selected' : ''}`}
                            onClick={() => handleRegionClick(region.regionId)}
                        >
                            {region.regionName}
                        </button>
                    ))}
                </div>

                <h3>관심 있는 카테고리 선택 (최대 3개)</h3>
                <div className="tag-button-container">
                    {tags.map((tag) => (
                        <button
                            key={tag.tagId}
                            className={`button ${selectedTags.includes(tag.tagId) ? 'selected' : ''}`}
                            onClick={() => handleTagButtonClick(tag.tagId)}
                            disabled={selectedTags.length >= 3 && !selectedTags.includes(tag.tagId)}
                        >
                            {/* 태그 버튼들 */}
                            {tag.tagName}
                        </button>
                    ))}
                </div>
            </div>
            <div className="search-container">
                {/* 검색입력창 */}
                <p className="result">총 <span>{totalElements}</span>건</p>
                <input
                    type="text"
                    className="search-input"
                    placeholder="이름, 지역 검색"
                    value={searchTerm}
                    onChange={handleSearchChange}  // 검색어 입력 시 처리
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {  // 엔터 키 감지
                            handleSearchSubmit();
                        }
                    }}
                />
                <button onClick={() => handleSubmit(0)} className="search-button">검색</button>
                {/* 검색 버튼 클릭 시 요청 */}
            </div>

            {/* 로딩 상태 표시 */}
            {loading && <div>Loading...</div>}

            {/* 지역 정보 리스트 */}
            <div className="locations-container">
                {locations.length > 0 ? (
                    <div className="card-container">
                        {locations.map((location, index) => (
                            <div className="location-card" key={index}>
                                <div className="like" onClick={() => handleLikeClick(location.locationId)}>
                                    {/* 좋아요 상태에 따라 아이콘 변경 */}
                                    <img
                                        src={likedLocations.includes(location.locationId) ? heartFilled : heart}
                                        alt="찜 아이콘"
                                    />
                                </div>
                                <Link to={`/attractionDetail/${location.locationId}`}>
                                    <img
                                        src={location.placeImgUrl}
                                        alt={location.locationName}
                                        className="location-image"
                                    />
                                </Link>

                                <div className="location-info">
                                    <Link to={`/attractionDetail/${location.locationId}`}>
                                        <h4>{location.locationName}</h4>
                                    </Link>
                                    <p>{location.regionName}</p>
                                    <p>
                                        <img src={starColor} alt="별 아이콘" className="star-icon"/>
                                        <span>{location.googleRating}</span>
                                        ({location.userRatingsTotal})
                                    </p>
                                    <p>{'#' + location.tags.join(' #')}</p>
                                    {/* Link로 이동하면서 location 정보를 state로 전달 */}
                                    {/*<Link to={`/attractionDetail/${location.locationId}`}>*/}
                                    {/*    상세 보기*/}
                                    {/*</Link>*/}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>해당하는 검색어 또는 카테고리에 맞는 여행지가 없습니다.</p>
                )}
            </div>

            {/* 페이지 네비게이션 */}
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}  // 첫 페이지에서는 이전 버튼 비활성화
                >
                    <img src={angleDoubleSmallLeft} alt="처음"/>
                </button>

                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                >
                    <img src={angleSmallLeft} alt="이전"/>
                </button>

                {/* ... 표시 */}
                {currentPage > 2 && (
                    <span>...</span>
                )}

                {/* 페이지 번호들 (현재 페이지를 기준으로 범위 생성) */}
                {generatePageNumbers().map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={currentPage === pageNumber ? 'active' : ''}
                    >
                        {pageNumber + 1} {/* 페이지 번호 출력 (1부터 시작) */}
                    </button>
                ))}

                {/* '...' 표시 */}
                {totalPages > 5 && currentPage > 2 && currentPage < totalPages - 3 && (
                    <span>...</span>
                )}


                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}  // 마지막 페이지에서는 다음 버튼 비활성화
                >
                    <img src={angleSmallRight} alt="다음"/>
                </button>
                <button
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={currentPage === totalPages - 1}
                >
                    <img src={angleDoubleSmallRight} alt="끝"/>
                </button>
            </div>
        </div>
    );
};

export default Attractions;
