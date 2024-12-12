import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "../utils/logoutUtils";
import axios from "../services/axios";
import { useSelector } from "react-redux";
import { Alert, Button, CircularProgress, Container, TextField } from "@mui/material";

const PasswordUpdate = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false); // Loading state for async operations

    const employeeNumber = useSelector((state) => state.auth.employeeNumber);
    const navigate = useNavigate();
    const handleLogout = useLogout();

    const validPassword = () => {
        const minLength = 8;
        const specialCharacterPattern = /[!@#$%^&*(),.?":{}|<>]/; // 특수문자
        const newErrors = {};

        if (newPassword.length < minLength) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!specialCharacterPattern.test(newPassword)) {
            newErrors.password = 'Password must contain at least one special character';
        }

        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Password does not match';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validPassword()) {
            return;
        }

        setLoading(true); // Show loading state

        console.log(newPassword);

        try {
            await axios.patch(`/users/${employeeNumber}/password`, {password : newPassword});
            alert('비밀번호가 수정되었습니다. 다시 로그인해주세요.');

            await handleLogout();
            navigate('/login');
        } catch (error) {
            setErrorMessage(error.response?.data?.password || '비밀번호 수정 중 오류가 발생하였습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '2rem', position: 'relative', top: 100 }}>
            <h2>비밀번호 수정</h2>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="새 비밀번호"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                />
                <TextField
                    label="비밀번호 확인"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={Boolean(errors.confirmPassword)}
                    helperText={errors.confirmPassword}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                />
                {errorMessage && <Alert severity="error" style={{ marginTop: '1rem' }}>{errorMessage}</Alert>}

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    style={{ marginTop: '1rem' }}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : '비밀번호 변경'}
                </Button>
            </form>
        </Container>
    );
};

export default PasswordUpdate;