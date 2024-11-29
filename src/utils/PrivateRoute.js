import React from 'react';
import {Navigate} from 'react-router-dom';
import {useSelector} from 'react-redux';

const PrivateRoute = ({element}) => {
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const isInitialized = useSelector((state) => state.auth.isInitialized); // Redux 초기화 여부 확인

    if (!isInitialized) {
        // Redux 상태 초기화 중에는 아무것도 렌더링하지 않음
        return null;
    }

    if (!isLoggedIn) {
        // 로그인되지 않은 경우 로그인 페이지로 리디렉션
        return <Navigate to="/login"/>;
    }

    // 로그인된 경우 해당 컴포넌트를 렌더링
    return element;
};

export default PrivateRoute;