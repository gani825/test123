import ApiClient from './ApiClient';

// 회원가입
export const register = async (userAndProfile) => {
    try {
        const response = await ApiClient.post('/user/register', userAndProfile);
        return response.data; // TokenInfo 객체 반환
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

// 로그인
export const login = async (credentials) => {
    try {
        const response = await ApiClient.post('/auth/login', credentials);
        const { accessToken, refreshToken } = response.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        return { accessToken, refreshToken };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// 로그아웃
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};
