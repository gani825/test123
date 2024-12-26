import React, { useState, useContext } from "react";
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
