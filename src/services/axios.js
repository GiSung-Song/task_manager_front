import axios from 'axios';
import {store} from "../redux/store";
import {setLoginState} from "../redux/authSlice";

const instance = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
});

instance.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const accessToken = state.auth.accessToken || localStorage.getItem('accessToken');

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await axios.post('http://localhost:8080/api/refresh', null, {withCredentials: true});
                const newAccessToken = refreshResponse.data.accessToken;

                store.dispatch(setLoginState({
                    isLoggedIn: true,
                    accessToken: newAccessToken
                }));

                localStorage.setItem('accessToken', newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return axios(originalRequest);
            } catch (refreshError) {
                alert("토큰 재발급 실패!! " + refreshError);

                deleteCookie('refreshToken');
                localStorage.removeItem('accessToken');

                window.location.href = '/login';
            }
        }

        if (error.response && error.response.status === 403) {
            alert(error.response.data.message || "권한이 없습니다.");
        }

        return Promise.reject(error);
    }
);

const deleteCookie = (name) => {
    document.cookie = `${name}=; Max-Age=-1; path=/`;
}

export default instance;