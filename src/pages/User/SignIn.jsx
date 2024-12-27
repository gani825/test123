import React, { useContext, useState, useEffect } from 'react';
import Modal from 'react-modal';
import { AuthContext } from '../../App';
import {handleSessionExpired, login, refreshToken} from '../../api/AuthService';
import { useNavigate } from 'react-router-dom';
import kakao from '../../img/icons/kakao.png';
import naver from '../../img/icons/naver.png';
import google from '../../img/icons/google.png';
import cross from "../../img/icons/cross.png";
import './SignIn.css';

Modal.setAppElement('#root'); // React Modal 설정

function SignIn() {
    const { user, setUser, isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({ userEmail: '', userPassword: '' });
    const [loginError, setLoginError] = useState(''); // 로그인 에러 상태
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    // 입력 값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!credentials.userEmail || !credentials.userPassword) {
            alert('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        try {
            const response = await login(credentials);
            const { accessToken, refreshToken, accessTokenExpiry } = response;

            // 로컬 스토리지에 토큰 및 만료 시간 저장
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('accessTokenExpiry', accessTokenExpiry);

            // React 상태 업데이트
            setUser({ email: credentials.userEmail }); // 사용자 정보 저장
            setIsAuthenticated(true);

            alert('로그인 성공!');
            window.location.href = '/';
        } catch (error) {
            console.error('로그인 실패:', error);
            alert('로그인 실패');
        }
    };

    // React 상태와 localStorage 동기화
    useEffect(() => {
        const checkAndRestoreSession = async () => {
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedAccessTokenExpiry = localStorage.getItem('accessTokenExpiry');
            const storedRefreshToken = localStorage.getItem('refreshToken');
            const storedUserEmail = localStorage.getItem('userEmail');

            if (storedAccessToken && storedAccessTokenExpiry) {
                if (Date.now() < storedAccessTokenExpiry) {
                    setIsAuthenticated(true);
                    setUser({ email: storedUserEmail });
                } else if (storedRefreshToken) {
                    try {
                        const newAccessToken = await refreshToken();
                        setIsAuthenticated(true);
                        setUser({ email: storedUserEmail });
                        console.log('AccessToken이 갱신되었습니다.');
                    } catch (error) {
                        console.error('세션 갱신 실패:', error.message);
                        handleSessionExpired(); // 통합된 함수 호출
                    }
                } else {
                    handleSessionExpired(); // 통합된 함수 호출
                }
            }
        };

        checkAndRestoreSession();
    }, []);

    const handleClose = () => {
        navigate('/'); // 홈으로 이동
    };

    // OAuth 로그인 핸들러 (예: Google)
    const handleOAuthLogin = () => {
        window.location.href = '/api/auth/oauth2/authorize/google'; // 백엔드 OAuth 엔드포인트
    };

    return (
        <div className="modal-overlay">
            <div className="Login-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={handleClose}>
                    <img src={cross} alt="close" />
                </button>
                <h2 className="modal-title">LOGO</h2>
                <form onSubmit={handleLogin}>
                    <h4 className="inputName">이메일</h4>
                    <input
                        type="email"
                        name="userEmail"
                        placeholder="이메일을 입력해주세요."
                        value={credentials.userEmail}
                        onChange={handleChange}
                        required
                    />
                    <h4 className="inputName">비밀번호</h4>
                    <input
                        type="password"
                        name="userPassword"
                        placeholder="비밀번호를 입력해주세요."
                        value={credentials.userPassword}
                        onChange={handleChange}
                        required
                    />
                    {loginError && <p className="login-error">{loginError}</p>}
                    <button type="submit" className="submit-button">이메일로 로그인</button>
                </form>

                <div className="login-links-container">
                    <span className="signup-link" onClick={() => navigate('/signup')}>
                        회원가입
                    </span>
                    <div className="find-links">
                        <span className="find-id-link" onClick={() => navigate('/find-id')}>
                            아이디 찾기
                        </span>
                        <span className="divider">|</span>
                        <span className="find-password-link" onClick={() => navigate('/find-password')}>
                            비밀번호 찾기
                        </span>
                    </div>
                </div>

                <div className="social-login">
                    <div className="social-login-divider">
                        <span className="divider-line"></span>
                        <span className="divider-text">SNS 간편 로그인</span>
                        <span className="divider-line"></span>
                    </div>
                    <div className="social-icons">
                        <div className="kakao-box">
                            <img src={kakao} alt="Kakao" />
                        </div>
                        <div className="naver-box">
                            <img src={naver} alt="Naver" />
                        </div>
                        <div className="google-box">
                            <img src={google} alt="Google" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;