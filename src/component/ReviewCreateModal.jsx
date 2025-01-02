// ReviewCreateModal.js
import React, { useState } from 'react';
import axios from 'axios';
import './ReviewCreateModal.css'

const ReviewCreateModal = ({mode, initialData = {}, locationId, onClose, onSuccess, accessToken }) => {
  const currentMode = mode || 'create' ;
  const [reviewId,setReviewId] = useState(initialData.reviewId || '');
  const [title,setTitle] = useState(initialData.title || '');
  const [rating, setRating] = useState(initialData.rating || 0);
  const [comment, setComment] = useState(initialData.comment || '');
  const [imageUrls, setImageUrls] = useState(['', '', '']); // 최대 3개의 이미지 URL
  const [imageFiles, setImageFiles] = useState([]); // 이미지 파일 상태 추가
  
  // 이미지 파일 선택 처리
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    const filteredFiles = files.filter((file) => {
      if (!validImageTypes.includes(file.type)) {
        alert(`${file.name}은(는) 허용되지 않는 파일 형식입니다.`);
        return false;
      }
      return true;
    });

    if (files.length + imageFiles.length > 3) {
      alert('최대 3개의 이미지만 첨부할 수 있습니다.');
      return;
    }
    setImageFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
  };



  const handleSubmit = async () => {
    const accessToken = localStorage.getItem('accessToken');


    const reviewDto = {
      reviewId : reviewId,
      locationId: locationId,
      title: title,
      rating: rating,
      comment: comment,
    };

    try {

      // 반환상태를 부모 컴포넌트로 전달할거임
      let responseStatus = "fail"; // 기본적으로 실패 상태로 설정

      if(currentMode === 'create'){
        await axios.post('http://localhost:5050/reviews/create', reviewDto,
          {
            headers:{
                'Authorization': `Bearer ${accessToken}`, // accessToken
                'Content-Type': 'application/json',
            }
          });

        alert('리뷰가 작성되었습니다!');
        responseStatus = "success"; // 성공 시 상태 변경

      } else if (currentMode === 'edit'){
        await axios.put(`http://localhost:5050/reviews/${initialData.reviewId}/edit`, reviewDto,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // accessToken 
            'Content-Type': 'application/json',
          }
        });

        alert('리뷰가 수정되었습니다!');
        responseStatus = "success"; // 성공 시 상태 변경

      }

      // 부모로 상태 전달
      onSuccess(responseStatus);
      onClose(); // 모달 닫기

    } catch (error) {
        console.error('리뷰 작성 중 오류 발생:', error?.response || error.message || error);
      alert('리뷰 처리에 실패했습니다.');
    }
  };

  // 미리보기 이미지 삭제
  const removeImage = (index) => {
    const newImageFiles = [...imageFiles];
    newImageFiles.splice(index, 1); // index 위치의 이미지 삭제
    setImageFiles(newImageFiles); // 상태 업데이트
  };

    return (
        <div className="reviewCreateModal">
            {/* 상단영역역 - 리뷰 작성 글씨, X버튼 */}
            <div className="modal-header">
                <p> 리뷰 작성 </p>
                <button className="close-button" onClick={onClose}>X</button>
            </div>

            {/* 메인영역 - 제목, 별점, 코멘트작성, 이미지 첨부 영역역 */}
            <div className="modal-main">
                <div className="title-container">
                    <label htmlFor="title" className="title-label">제목</label>
                    <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    maxLength={40}
                    placeholder="총평을 간단하게 입력해주세요 (최대 40자)"
                    />
                </div>

                <div className="rating-container">
                    <label htmlFor="rating" className="rating-label">평점</label>
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map(star => (
                        <span
                            key={star}
                            className={`star ${star <= rating ? 'filled' : ''}`}
                            onClick={() => setRating(star)}
                        >
                            ★
                        </span>
                        ))}
                    </div>
                </div>

                <div className="comment-container">
                    <label htmlFor="comment" className="comment-label">댓글</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        maxLength={500}
                        placeholder="리뷰를 작성해주세요 (최대 500자)"
                    />
                </div>

                <div className="image-container">
                    <label htmlFor="image" className="image-label">사진 첨부 (최대 3개)</label>
                    <div className="file-upload-container">

                        {/* "클릭하여 파일 사진 추가하기" 텍스트 클릭 시 input 활성화 */}
                        <div
                            className="file-upload-text"
                            onClick={() => document.getElementById('image').click()} // input 클릭 활성화
                        >
                            클릭하여 파일 사진 추가하기
                        </div>

                        {/* 파일 업로드 영역 */}
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            style={{ display: 'none' }} // 파일 선택 버튼 숨기기
                        />
                        {/* 업로드한 사진 미리보기 영역 */}
                        <div className="image-preview">
                            {imageFiles.length > 0 && (
                                imageFiles.map((file, index) => (
                                <div className="image-preview-item" key={index}>
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Preview ${index}`}
                                        style={{ width: '100px', height: '100px', margin: '5px' }}
                                    />
                                    {/* X 버튼 */}
                                    <button
                                        className="remove-image-btn"
                                        onClick={() => removeImage(index)} // 이미지 삭제 함수
                                    >
                                        X
                                    </button>
                                </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* 하단영역 - 버튼 */}
            <div className="modal-footer">
                <button onClick={onClose} className="cancel-button">취소</button>
                <button onClick={handleSubmit} className="submit-button">저장</button>
            </div>
        </div>
    );
};

export default ReviewCreateModal;