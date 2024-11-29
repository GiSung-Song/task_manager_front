import React, {useEffect} from 'react';
import {Provider, useDispatch} from 'react-redux';
import {store, persistor} from './redux/store';
import NavBar from "./components/NavBar";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import RegisterUser from "./pages/RegisterUser";
import UserProfile from "./pages/UserProfile";
import PasswordUpdate from "./pages/PasswordUpdate";
import {setLoginState} from "./redux/authSlice";
import PrivateRoute from "./utils/PrivateRoute";
import {PersistGate} from "redux-persist/integration/react";

const AppWrapper = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
            dispatch(setLoginState({isLoggedIn: true, accessToken}));
        } else {
            dispatch(setLoginState({isLoggedIn: false, accessToken: null}));
        }
    }, [dispatch]);

    return (
        <>
            <NavBar/>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterUser/>}/>
                {/* 로그인된 사용자만 접근 가능 */}
                <Route path="/" element={<PrivateRoute element={<MainPage/>}/>}/>
                <Route path="/profile/:employeeNumber" element={<PrivateRoute element={<UserProfile/>}/>}/>
                <Route path="/password-update" element={<PrivateRoute element={<PasswordUpdate/>}/>}/>
            </Routes>
        </>
    );
};

function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <Router>
                    <AppWrapper/> {/* 로그인 상태 처리는 AppWrapper에서 */}
                </Router>
            </PersistGate>
        </Provider>
    );
}

export default App;