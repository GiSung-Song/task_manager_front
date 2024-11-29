import {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import axios from "../services/axios";
import {setLoginState} from "../redux/authSlice";
import {TextField, Button, Link, Typography, Box} from "@mui/material";

const LoginPage = () => {
    const [employeeNumber, setEmployeeNumber] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

    // 로그인된 상태이면 메인 페이지로 리디렉션
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    const validateForm = () => {
        setIsFormValid(!!employeeNumber && !!password);
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('/login', {
                employeeNumber,
                password,
            });

            const accessToken = response.data.data.accessToken;

            console.log(response.data.data);

            localStorage.setItem("accessToken", accessToken);

            dispatch(setLoginState({isLoggedIn: true, accessToken}));

            navigate('/'); // 로그인 후 메인 페이지로 리디렉션
        } catch (error) {
            setErrorMessage(error.response?.data?.error || '로그인 실패. 다시 시도해주세요.');
        }
    };

    const navigateToRegister = () => {
        navigate('/register');
    };

    return (
        <Box sx={{maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center'}}>
            <form>
                <Typography variant="h5" component="h2" gutterBottom>
                    로그인
                </Typography>

                <TextField
                    label="사원번호"
                    type="text"
                    value={employeeNumber}
                    onChange={(e) => {
                        setEmployeeNumber(e.target.value);
                        validateForm();
                    }}
                    fullWidth
                    margin="normal"
                />

                <TextField
                    label="비밀번호"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        validateForm();
                    }}
                    fullWidth
                    margin="normal"
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLogin}
                    disabled={!isFormValid}
                    fullWidth
                >
                    로그인
                </Button>

                <Link
                    component="button"
                    variant="body2"
                    onClick={navigateToRegister}
                    sx={{
                        display: 'block',
                        marginTop: '10px',
                        textDecoration: 'underline',
                        color: 'olivedrab',
                        cursor: 'pointer'
                    }}
                >
                    회원가입
                </Link>

                {errorMessage && (
                    <Typography variant="body2" color="error" sx={{marginTop: '10px'}}>
                        {errorMessage}
                    </Typography>
                )}
            </form>
        </Box>
    );
};

export default LoginPage;