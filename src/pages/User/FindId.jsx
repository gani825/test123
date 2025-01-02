import React, {useState} from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import cross from "../../img/icons/cross.png"; // 닫기 버튼 아이콘
import back from "../../img/icons/back.png";   // 뒤로가기 아이콘
import './FindId.css'; 
import axios from "axios";

Modal.setAppElement('#root'); // React Modal 설정

function FindId() {
    const navigate = useNavigate();

    const handleBackToSignIn = () => {
        navigate(-1); // 이전 페이지로 이동
    };

    const [phoneNumber, setPhoneNumber] = useState('');  // 전화번호 상태
    const [code, setCode] = useState('');  // 인증번호 상태
    const [isVerificationSent, setIsVerificationSent] = useState(false);  // 인증번호 발송 여부 상태

    const handleSendVerificationCode = async () => {
        // 실제 인증번호 보내는 API 호출 로직을 여기에 추가
        try {
            const response = await axios.post("http://localhost:5050/api/phone/send-one", {
                    phoneNumber : phoneNumber
            });
            console.log(response);
            console.log('전화번호로 인증번호 전송:', phoneNumber);
            setIsVerificationSent(true);  // 인증번호 발송 후 상태 업데이트

        }catch (error) {
            alert("인증 문자 발송 실패. 다시 시도해주세요.");
            console.error("인증 문자 발송 실패:", error.response?.data || error.message);
        }
    };

    const handleVerifyCode = async () => {
        try {
            const response = await axios.post("http://localhost:5050/api/phone/verify", {
                phoneNumber: phoneNumber.trim(),
                code: code
            })
            console.log(response);
            // 실제 인증번호 확인 로직을 여기에 추가
            console.log('입력된 인증번호:', code);
        }catch (error){
            console.log(error)
        }
    };

    return (
        <div className="FindId">
        <div className="findId-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="findId-title">아이디 찾기...</h2>

            {/* 전화번호 입력 */}
            {!isVerificationSent ? (
                <div>
                    <input
                        type="text"
                        placeholder="전화번호 입력"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="phone-input"
                    />
                    <button className="send-verification-button" onClick={handleSendVerificationCode}>
                        인증번호 받기
                    </button>
                </div>
            ) : (
                <div>
                    <input
                        type="text"
                        placeholder="인증번호 입력"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="verification-input"
                    />
                    <button className="verify-button" onClick={handleVerifyCode}>
                        확인
                    </button>
                </div>
            )}

            <button className="join-back-button" onClick={handleBackToSignIn}>
                로그인 하기
            </button>
        </div>
    </div>
    );
}

export default FindId;