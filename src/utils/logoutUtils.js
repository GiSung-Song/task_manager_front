import {useDispatch} from "react-redux";
import {logout} from "../redux/authSlice";
import axios from "../services/axios";

export const useLogout = () => {
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            await axios.post('/logout');

            localStorage.removeItem('accessToken');
            dispatch(logout());
        } catch (error) {
            alert('로그아웃 실패 : ' + error.message);
        }
    };

    return handleLogout;
}