import {createSlice} from '@reduxjs/toolkit';
import jwtDecode from 'jwt-decode';

// 초기 상태 정의
const initialState = {
    isLoggedIn: false, // 로그인 상태
    accessToken: null, // Access Token
    employeeNumber: null, // 사원 번호
    department: null, // 부서
    level: null, // 직급
    isInitialized: false, // 상태 초기화 여부
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoginState: (state, action) => {
            const {isLoggedIn, accessToken} = action.payload;

            state.isLoggedIn = isLoggedIn;

            if (accessToken) {
                state.accessToken = accessToken;
                try {
                    const decoded = jwtDecode(accessToken);
                    state.employeeNumber = decoded.employeeNumber || null;
                    state.department = decoded.department || null;
                    state.level = decoded.level || null;
                } catch (error) {
                    console.error('Invalid access token', error);
                    state.accessToken = null;
                    state.employeeNumber = null;
                    state.department = null;
                    state.level = null;
                }
            } else {
                state.accessToken = null;
                state.employeeNumber = null;
                state.department = null;
                state.level = null;
            }

            state.isInitialized = true; // 상태 초기화 완료
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.accessToken = null;
            state.employeeNumber = null;
            state.department = null;
            state.level = null;
            state.isInitialized = true; // 로그아웃 후에도 초기화 상태 유지
        },
    },
});

export const {setLoginState, logout} = authSlice.actions;
export default authSlice.reducer;