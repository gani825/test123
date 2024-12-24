import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import back from '../../img/back.png';
import cross from '../../img/cross.png';

const SignUp = () => {
    const navigate = useNavigate();

    // 입력값 상태 관리
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // 모든 입력값이 채워졌는지 확인
    const isFormValid = email && nickname && password && confirmPassword;

    const handleClose = () => {
        navigate(-1); // 이전 페이지로 이동
    };

    const handleBackToSignIn = () => {
        navigate(-1); // 이전 페이지로 이동
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        // 회원가입 로직 실행
        alert('회원가입 성공!');
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
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
                    <div className="input-with-button">
                        <input
                            type="email"
                            placeholder="이메일을 입력해주세요."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            className={`check-button ${email ? '' : 'disabled'}`}
                            type="button"
                            disabled={!email}
                        >
                            확인
                        </button>
                    </div>
                    <h4 className="SignUpInputName">닉네임</h4>
                    <div className="input-with-button">
                        <input
                            type="text"
                            placeholder="닉네임을 입력해주세요."
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                        <button
                            className={`check-button ${nickname ? '' : 'disabled'}`}
                            type="button"
                            disabled={!nickname}
                        >
                            확인
                        </button>
                    </div>
                    <h4 className="SignUpInputName">비밀번호</h4>
                    <input
                        type="password"
                        placeholder="영문, 숫자, 특수문자 포함 8자리 이상"
                        className="password-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <h4 className="SignUpInputName">비밀번호 확인</h4>
                    <input
                        type="password"
                        placeholder="영문, 숫자, 특수문자 포함 8자리 이상"
                        className="password-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className={`submit-button ${isFormValid ? '' : 'disabled'}`}
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
