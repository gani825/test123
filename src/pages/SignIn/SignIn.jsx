import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; // Firebase 설정 파일 경로
import { AuthContext } from '../../App'; // AuthContext 가져오기
import './SignIn.css';
import kakao from '../../img/icons/kakao.png';
import naver from '../../img/icons/naver.png';
import google from '../../img/icons/google.png';
import cross from "../../img/icons/cross.png";

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser, setIsAuthenticated } = useContext(AuthContext); // AuthContext에서 상태 업데이트 함수 가져오기
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user); // 로그인된 사용자 정보 저장
            setIsAuthenticated(true); // 로그인 상태 true로 설정
            alert('로그인이 완료되었습니다!');
            navigate('/'); // 로그인 성공 시 홈으로 이동
        } catch (error) {
            console.error('로그인 실패:', error.message);
            if (error.code === 'auth/user-not-found') {
                alert('등록되지 않은 이메일입니다.');
            } else if (error.code === 'auth/wrong-password') {
                alert('비밀번호가 틀렸습니다.');
            } else {
                alert(`로그인에 실패했습니다: ${error.message}`);
            }
        }
    };

    const handleClose = () => {
        navigate('/'); // 홈으로 이동
    };

    return (
        <div className="modal-overlay">
            <div className="Login-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={handleClose}>
                    <img src={cross} alt="close" />
                </button>
                <h2 className="modal-title">LOGO</h2>
                <form onSubmit={handleSignIn}>
                    <h4 className="inputName">이메일</h4>
                    <input
                        type="email"
                        placeholder="이메일을 입력해주세요."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <h4 className="inputName">비밀번호</h4>
                    <input
                        type="password"
                        placeholder="비밀번호를 입력해주세요."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
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
};

export default SignIn;
