import React, { useContext, useState, useEffect } from 'react';
import Modal from 'react-modal';
import { AuthContext } from '../../App';
import {handleSessionExpired, login, refreshToken} from '../../api/AuthService';
import Register from './Register'; // 회원가입 폼 컴포넌트

Modal.setAppElement('#root'); // React Modal 설정

function SignIn() {
    const { user, setUser, isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({ userEmail: '', userPassword: '' });
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false); // 회원가입 모달 상태
    const [loginError, setLoginError] = useState(''); // 로그인 에러 상태

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
    // 회원가입 모달 열기
    const openRegisterModal = () => {
        setIsRegisterModalOpen(true);
    };

    // 회원가입 모달 닫기
    const closeRegisterModal = () => {
        setIsRegisterModalOpen(false);
    };

    // OAuth 로그인 핸들러 (예: Google)
    const handleOAuthLogin = () => {
        window.location.href = '/api/auth/oauth2/authorize/google'; // 백엔드 OAuth 엔드포인트
    };

    return (
        <div>
            <h2>로그인</h2>
            <form onSubmit={handleLogin}>
                <input
                    name="userEmail"
                    placeholder="이메일"
                    value={credentials.userEmail} // 상태 값 연결
                    onChange={handleChange}
                />
                <input
                    name="userPassword"
                    type="password"
                    placeholder="비밀번호"
                    value={credentials.userPassword} // 상태 값 연결
                    onChange={handleChange}
                />
                <button type="submit">로그인</button>
            </form>

            {loginError && <p style={{ color: 'red' }}>{loginError}</p>}

            {/* 회원가입 모달 열기 버튼 */}
            <button onClick={openRegisterModal}>회원가입</button>

            {/* OAuth 버튼 */}
            <div>
                <button onClick={handleOAuthLogin}>Google로 로그인</button>
                <button onClick={() => alert('다른 OAuth 로그인 기능 추가 필요')}>
                    Facebook로 로그인
                </button>
            </div>

            {/* 회원가입 모달 */}
            <Modal
                isOpen={isRegisterModalOpen}
                onRequestClose={closeRegisterModal}
                contentLabel="회원가입"
                style={{
                    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    content: {
                        margin: 'auto',
                        maxWidth: '500px',
                        borderRadius: '10px',
                        padding: '20px',
                    },
                }}
            >
                <button onClick={closeRegisterModal}>X 닫기</button>
                <Register />
            </Modal>
        </div>
    );
}

export default SignIn;
