import React from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import cross from "../../img/icons/cross.png"; // 닫기 버튼 아이콘
import back from "../../img/icons/back.png";   // 뒤로가기 아이콘
import './FindId.css'; 

Modal.setAppElement('#root'); // React Modal 설정

function FindId() {
    const navigate = useNavigate();

    const handleBackToSignIn = () => {
        navigate(-1); // 이전 페이지로 이동
    };
    
    return (
        <div className="FindId">
            <div className="findId-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="findId-title">아이디 찾기...</h2>
                <button className="join-back-button" onClick={handleBackToSignIn}>
                    로그인 하기
                </button>
                {/* 여기에 원하는 내용 추가 */}
            </div>
        </div>
    );
}

export default FindId;
