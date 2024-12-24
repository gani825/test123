import React, { useState } from 'react';
import { register } from '../services/AuthService';

function Register() {
    const [formData, setFormData] = useState({
        userEmail: '',
        userPassword: '',
        userPhone: '',
        userNickname: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userAndProfile = {
                userDto: {
                    userEmail: formData.userEmail,
                    userPassword: formData.userPassword,
                    userPhone: formData.userPhone,
                },
                userProfileDto: {
                    userNickname: formData.userNickname,
                },
            };
            await register(userAndProfile);
            alert('회원가입 성공!');
        } catch (error) {
            alert('회원가입 실패!');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="userEmail" placeholder="이메일" onChange={handleChange} />
            <input name="userPassword" type="password" placeholder="비밀번호" onChange={handleChange} />
            <input name="userPhone" placeholder="전화번호" onChange={handleChange} />
            <input name="userNickname" placeholder="닉네임" onChange={handleChange} />
            <button type="submit">회원가입</button>
        </form>
    );
}

export default Register;
