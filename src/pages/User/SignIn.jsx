import React, { useContext, useState } from 'react';
import { AuthContext } from '../../App';
import { login } from '../../services/AuthService'; // login 함수 임포트

function SignIn() {
    const { setUser, setIsAuthenticated } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({ userEmail: '', userPassword: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const tokens = await login(credentials);
            setUser(tokens.accessToken);
            setIsAuthenticated(true);
            alert('로그인 성공!');
        } catch (error) {
            alert('로그인 실패!');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="userEmail" placeholder="이메일" onChange={handleChange} />
            <input name="userPassword" type="password" placeholder="비밀번호" onChange={handleChange} />
            <button type="submit">로그인</button>
        </form>
    );
}

export default SignIn;
