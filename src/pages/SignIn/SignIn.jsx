import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';
import kakao from '../../img/kakao.png';
import naver from '../../img/naver.png';
import google from '../../img/google.png';

const SignIn = () => {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate(-1); // 이전 페이지로 이동
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="Login-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={handleClose}>
                    ✖
                </button>
                <h2 className="modal-title">LOGO</h2>
                <form>
                    <h4 className="inputName">이메일</h4>
                    <input type="email" placeholder="이메일을 입력해주세요." />
                    <h4 className="inputName">비밀번호</h4>
                    <input type="password" placeholder="비밀번호를 입력해주세요." />
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
