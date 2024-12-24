import React, { useState, useContext } from "react";
import { AuthContext } from "../../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
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

    return (
        <form onSubmit={handleSubmit}>
            <h1>회원가입</h1>
            <input
                type="email"
                name="userEmail"
                placeholder="이메일"
                onChange={handleChange}
                required
            />
            <input
                type="password"
                name="userPassword"
                placeholder="비밀번호"
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="userPhone"
                placeholder="전화번호"
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="userNickname"
                placeholder="닉네임"
                onChange={handleChange}
                required
            />
            <button type="submit">회원가입</button>
        </form>
    );
};

export default Register;
