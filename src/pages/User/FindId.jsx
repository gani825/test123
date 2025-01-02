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
    const [isVerified, setIsVerified] = useState(false); // 인증 여부 상태
    const [emails, setEmails] = useState([]); // 이메일 저장 상태
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태

    const handleSendVerificationCode = async () => {
        // 실제 인증번호 보내는 API 호출 로직을 여기에 추가
        try {
            const response = await axios.post("http://localhost:5050/api/phone/send-one", {
                    phoneNumber : phoneNumber
            });

            setIsVerificationSent(true);  // 인증번호 발송 후 상태 업데이트
            setErrorMessage('');

        }catch (error) {
            setErrorMessage('인증 문자 발송 실패. 다시 시도해주세요.');
            console.error(error.response?.data || error.message);
        }
    };

    const handleVerifyCode = async () => {
        try {
            const response = await axios.post("http://localhost:5050/api/phone/verify", {
                phoneNumber: phoneNumber.trim(),
                code: code.trim(),
            })
            console.log(response);
            if (response.data === '인증에 성공했습니다.') {
                setIsVerified(true);
                setErrorMessage('');
                await handleFindEmail(); // 인증 성공 후 이메일 찾기
            } else {
                setErrorMessage('인증에 실패했습니다.');
            }
        } catch (error) {
            setErrorMessage('인증 처리 중 오류가 발생했습니다.');
            console.error(error.response?.data || error.message);
        }
    };

    const handleFindEmail = async () => {
        try {
            const formattedPhoneNumber = formatPhoneNumber(phoneNumber); // 전화번호 포맷팅
            const response = await axios.post("http://localhost:5050/user/find-Email", {
                isVerified: 'true',
                phoneNumber: formattedPhoneNumber
            });
            console.log(response)
            setEmails(response.data); // 성공적으로 이메일을 가져오면 상태 업데이트
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('아이디 조회 실패. 다시 시도해주세요.');
            console.error(error.response?.data || error.message);
        }
    };

    // 전화번호 포메팅
    const formatPhoneNumber = (number) => {
        return number
            .replace(/[^0-9]/g, '') // 숫자 이외의 문자를 제거
            .replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3'); // 010-1234-5678 형식으로 변환
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
                ) : !isVerified ? (
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
                ) : (
                    <div>
                        <h3>찾은 이메일</h3>
                        {emails.length > 0 ? (
                            <ul>
                                {emails.map((email, index) => (
                                    <li key={index}>{email}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>이메일을 찾을 수 없습니다.</p>
                        )}
                    </div>
                )}

                {errorMessage && <p className="error-message">{errorMessage}</p>}


                <button className="join-back-button" onClick={handleBackToSignIn}>
                    로그인 하기
                </button>
            </div>
        </div>
    );
}

export default FindId;