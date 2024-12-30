import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './SignUp.css';
import back from "../../img/icons/back.png";
import cross from "../../img/icons/cross.png"; 

const SignUp = () => {
    const [formData, setFormData] = useState({
        userEmail: "",
        userPassword: "",
        userPhone: "",
        userNickname: "",
    });

    const { setUser, setIsAuthenticated } = useContext(AuthContext); // React 상태 업데이트 함수
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleClose = () => {
        navigate('/'); // 홈페이지로 이동
    };

    const handleBackToSignIn = () => {
        navigate(-1); // 이전 페이지로 이동
    };

    const [emailMessage, setEmailMessage] = useState(""); // 이메일 중복 확인 메시지 상태

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 비밀번호 확인
        if (formData.userPassword !== formData.userPasswordConfirm) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
        
        // 비밀번호 강도 확인
        if (!/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(formData.userPassword)) {
            alert("비밀번호는 영문, 숫자, 특수문자를 포함하여 8자리 이상이어야 합니다.");
            return;
        }

        try {
            const payload = {
                userDto: {
                    userEmail: formData.userEmail,
                    userPassword: formData.userPassword,
                    userPhone: formData.userPhone,
                },
                userProfileDto: {
                    userNickname: formData.userNickname,
                },
            };

            const response = await axios.post("http://localhost:5050/user/register", payload);
            const { accessToken, refreshToken, accessTokenExpiry } = response.data;

            // 로컬 스토리지에 JWT 토큰 및 만료 시간 저장
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("accessTokenExpiry", accessTokenExpiry);
            localStorage.setItem("userEmail", formData.userEmail);

            // React 상태 업데이트
            setUser({ email: formData.userEmail });
            setIsAuthenticated(true);

            alert("회원가입 및 로그인 성공!");
            navigate("/"); // 홈 화면으로 이동
        } catch (error) {
            console.error("회원가입 실패:", error.response?.data || error.message);
            alert("회원가입에 실패했습니다. 데이터를 확인하세요.");
        }
    };

    const isFormValid = formData.userEmail && formData.userPassword && formData.userNickname && formData.userPhone;
    const [isEmailDuplicate, setIsEmailDuplicate] = useState(false); // 이메일 중복 여부 상태


    // 이메일 중복확인 요청
    const checkEmailDuplicate = async () => {

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.userEmail)) { // 이메일 형식 체크
            setEmailMessage("이메일 형식이 아닙니다.");
            return; // 형식이 올바르지 않으면 함수 종료
        }

        try {
            const response = await axios.post(`http://localhost:5050/user/duplicate-email`, { userEmail: formData.userEmail });
            setIsEmailDuplicate(response.data); // 중복 여부에 따라 상태 업데이트
            if (response.data) {
                setEmailMessage("사용 가능한 이메일입니다.");
            } else {
                setEmailMessage("이메일이 이미 존재합니다.");
            }
        } catch (error) {
            console.error("이메일 중복 확인 실패:", error.response?.data || error.message);
            alert("이메일 중복 확인에 실패했습니다.");
        }
    };

    const [isEmailSent, setIsEmailSent] = useState(false); // 인증 이메일 전송 여부 상태
    const [emailSentTime, setEmailSentTime] = useState(null); // 이메일 발송 시간 상태
    const [isVerificationInputVisible, setIsVerificationInputVisible] = useState(false); // 인증 번호 입력 칸 표시 여부

    // 이메일 인증 요청 보내기
    const sendVerificationEmail = async (email) => {

        // 인증 이메일 재전송 제한 시간 설정 (현재 10초)
        const now = new Date().getTime();
        if (isEmailSent && emailSentTime && now - emailSentTime < 10 * 1000) {
            alert("인증 이메일을 너무 자주 요청했습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        // 이메일 발송 시점에 바로 요청을 보내고, 재전송을 차단
        setIsEmailSent(true); // 이메일 발송 요청 중 상태로 변경
        setEmailMessage("인증 이메일 발송 중... 발송에는 최대 30초정도 소요될 수 있습니다.");

        try {
            const response = await axios.post("http://localhost:5050/api/email/send", { userEmail: email });
            alert(response.data); // 인증 이메일 발송 메시지
            setEmailMessage("인증 이메일이 발송되었습니다. 이메일을 확인해 주세요.");
            setEmailSentTime(now); // 이메일 발송 시간 기록
            // setIsEmailSent(true);  // 상태 업데이트 후 UI 갱신
            setIsVerificationInputVisible(true); // 인증번호 입력 칸 표시
        
        } catch (error) {
            console.error("인증 이메일 발송 실패:", error.response?.data || error.message);
            alert("인증 이메일 발송에 실패했습니다.");
        }
    };

        // 인증 코드 입력 핸들러
    const handleVerificationCodeChange = (e) => {
        setVerificationCode(e.target.value);
    };

    useEffect(() => {
        console.log("userEffect로 isEmailSent상태 확인 : "+isEmailSent);
    }, [isEmailSent]); // isEmailSent 상태가 변경될 때마다 실행

    // 인증 확인 요청
    const handleVerifyCode = async () => {
        try {
            const response = await axios.post("http://localhost:5050/api/email/verify", {
                userEmail: formData.userEmail,
                code: verificationCode,
            });
            if (response.data === "인증에 성공했습니다.") {
                setIsVerified(true);
                alert("인증에 성공했습니다!");
            } else {
                alert("인증에 실패했습니다. 다시 시도해 주세요.");
            }
        } catch (error) {
            console.error("인증 확인 실패:", error.response?.data || error.message);
            alert("인증 확인에 실패했습니다.");
        }
    };

    const [verificationCode, setVerificationCode] = useState(""); // 인증 코드 상태
    const [isVerified, setIsVerified] = useState(false); // 인증 상태

    return (
        <div className="modal-overlay">
            <div className="Join-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="Join-close-button" onClick={handleClose}>
                    <img src={cross} alt="close" />
                </button>
                <button className="Join-back-button" onClick={handleBackToSignIn}>
                    <img src={back} alt="back" />
                </button>
                <h2 className="modal-title">회원가입</h2>
                <form onSubmit={handleSubmit}>
                    <h4 className="SignUpInputName">이메일</h4>
                    <input
                        type="email"
                        name="userEmail"
                        placeholder="이메일을 입력해주세요."
                        value={formData.userEmail}
                        onChange={handleChange}
                    />
                    <button type="button" onClick={checkEmailDuplicate}>중복 확인</button>
                    {/* 중복 확인 메시지 출력 */}
                    {emailMessage && <p className="email-message">{emailMessage}</p>}

                    {/* 인증 번호 요청 버튼 */}
                    {isEmailDuplicate && !isEmailSent && emailMessage === "사용 가능한 이메일입니다." && (
                        <div>
                            <button type="button" onClick={() => sendVerificationEmail(formData.userEmail)}>
                                인증번호 요청
                            </button>
                        </div>
                    )}

                    {/* 인증 번호 입력 폼 */}
                    {!isVerified && isEmailSent && emailMessage && isVerificationInputVisible === "사용 가능한 이메일입니다." &&  (
                        <div>
                            <h4>이메일로 발송된 인증 번호를 입력해주세요.</h4>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={handleVerificationCodeChange}
                                placeholder="인증 번호"
                            />
                            <button type="button" onClick={handleVerifyCode}>인증 확인</button> 
                        </div>
                    )}

                    <h4 className="SignUpInputName">닉네임</h4>
                    <input
                        type="text"
                        name="userNickname"
                        placeholder="닉네임을 입력해주세요."
                        value={formData.userNickname}
                        onChange={handleChange}
                    />
                    <h4 className="SignUpInputName">전화번호</h4>
                    <input
                        type="text"
                        name="userPhone"
                        placeholder="전화번호를 입력해주세요. 예: 010-1234-5678"
                        value={formData.userPhone}
                        onChange={handleChange}
                    />
                    <h4 className="SignUpInputName">비밀번호</h4>
                    <input
                        type="password"
                        name="userPassword"
                        placeholder="영문, 숫자, 특수문자 포함 8자리 이상"
                        value={formData.userPassword}
                        onChange={handleChange}
                    />
                    <h4 className="SignUpInputName">비밀번호 확인</h4>
                    <input
                        type="password"
                        name="userPasswordConfirm"
                        placeholder="비밀번호 확인"
                        value={formData.userPasswordConfirm}
                        onChange={handleChange}
                    />
                    <button
                        type="submit"
                        className={`submit-button ${isFormValid ? "" : "disabled"}`}
                        disabled={!isFormValid}
                    >
                        회원가입하고 로그인하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
