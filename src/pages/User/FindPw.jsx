import React from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import cross from "../../img/icons/cross.png"; // 닫기 버튼 아이콘
import back from "../../img/icons/back.png";   // 뒤로가기 아이콘
import './FindPw.css'; 

Modal.setAppElement('#root'); // React Modal 설정

function FindPw() {
    const navigate = useNavigate();

    // 닫기 버튼 클릭 시 동작
    const handleClose = () => {
        navigate('/'); // 홈으로 이동
    };

    const handleBackToSignIn = () => {
        navigate(-1); // 이전 페이지로 이동
    };
    
    return (
        <div className="modal-overlay">
            <div className="FindPw-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="FindPw-close-button" onClick={handleClose}>
                    <img src={cross} alt="close" />
                </button>
                <button className="FindPw-back-button" onClick={handleBackToSignIn}>
                    <img src={back} alt="back" />
                </button>
                <h2 className="modal-title">아이디 찾기..</h2>
                {/* 여기에 원하는 내용 추가 */}
            </div>
        </div>
    );
}

export default FindPw;