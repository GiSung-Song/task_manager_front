import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../services/axios";
import { Alert, Button, CircularProgress, Container, TextField } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const { employeeNumber } = useParams();
    const { employeeNumber: loggedInEmployeeNumber, department, level } = useSelector(state => state.auth);

    // 휴대폰 번호 변경 권한이 있는지 확인
    const canUpdatePhoneNumber = useMemo(() => {
        if (!user) {
            return false;
        }

        return (
            user.employeeNumber === loggedInEmployeeNumber ||
            (department.startsWith('HR') && level >= 4)
        );
    }, [user, loggedInEmployeeNumber, department, level]);

    // 비밀번호 변경 권한 확인 (자기 자신만)
    const canUpdatePassword = useMemo(() => {
        return user && user.employeeNumber === loggedInEmployeeNumber;
    }, [user, loggedInEmployeeNumber]);

    // 사용자 정보 조회
    const fetchUserInfo = useCallback(async () => {
        if (user) return; // 이미 정보가 있으면 재호출 방지

        try {
            const response = await axios.get(`/users/${employeeNumber}`);
            setUser(response.data.data);
            setPhoneNumber(response.data.data.phoneNumber);
        } catch (error) {
            setErrorMessage(error.response?.data?.error || '회원정보 조회 중 오류가 발생하였습니다.');
            navigate('/');
        }
    }, [employeeNumber, navigate, user]);  // user가 변경될 때는 다시 호출되지 않음

    // 핸드폰 번호 유효성 검사 및 수정
    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;

        if (!/^\d*$/.test(value)) {
            setPhoneError('핸드폰 번호는 숫자만 입력할 수 있습니다.');
            return;
        }

        if (value.length > 11) {
            setPhoneError('핸드폰 번호는 최대 11자리여야 합니다.');
            return;
        }

        setPhoneError('');
        setPhoneNumber(value);
    };

    const updatePhoneNumber = async () => {
        if (phoneError || phoneNumber.length < 10 || phoneNumber.length > 11) {
            setPhoneError('핸드폰 번호는 10~11자리 숫자로 입력해야 합니다.');
            return;
        }

        try {
            await axios.patch(`/users/${employeeNumber}`, { phoneNumber });
            alert('핸드폰 번호가 수정되었습니다.');
            setUser(prevState => ({
                ...prevState,
                phoneNumber: phoneNumber
            }));  // 상태 업데이트 후 fetchUserInfo 재호출 방지
        } catch (error) {
            setErrorMessage(error.response?.data?.phoneNumber || '핸드폰 번호 수정 중 오류가 발생하였습니다.');
        }
    };

    const resetPassword = async () => {
        try {
            const response = await axios.post(`/users/${employeeNumber}/reset`);
            alert(`비밀번호를 초기화했습니다. 새 비밀번호 : : ${response.data.tempPassword}`);
        } catch (error) {
            setErrorMessage('비밀번호 초기화 중 오류가 발생하였습니다.');
        }
    }

    useEffect(() => {
        if (employeeNumber && !user) {
            fetchUserInfo();  // 사용자 정보 조회
        }
    }, [employeeNumber]);  // user를 의존성 배열에서 제거

    // 비밀번호 수정 페이지로 이동
    const navigateToPasswordChange = () => {
        navigate('/password-change');
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
            {user ? (
                <form>
                    <h2>회원정보</h2>
                    <TextField
                        label="사원번호"
                        value={user.employeeNumber}
                        slotProps={{
                            input: { readOnly: true }
                        }}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="이름"
                        value={user.username}
                        slotProps={{
                            input: { readOnly: true }
                        }}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="핸드폰 번호"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        error={!!phoneError}
                        helperText={phoneError}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="부서명"
                        value={user.departmentName}
                        slotProps={{
                            input: { readOnly: true }
                        }}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="직급"
                        value={user.roleName}
                        slotProps={{
                            input: { readOnly: true }
                        }}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={updatePhoneNumber}
                        disabled={!canUpdatePhoneNumber || !!phoneError}
                        style={{ marginTop: '1rem' }}
                    >
                        핸드폰 번호 수정
                    </Button>

                    {canUpdatePassword && (
                        <Button
                            color="secondary"
                            variant="contained"
                            onClick={navigateToPasswordChange}
                            disabled={!canUpdatePassword}
                            style={{ marginTop: '1rem' }}
                        >
                            비밀번호 수정
                        </Button>
                    )}

                    {department.startsWith('HR') && level >= 4 && (
                        <Button
                            color="secondary"
                            variant="contained"
                            onClick={resetPassword}
                            style={{ marginTop: '1rem' }}
                        >
                            비밀번호 초기화
                        </Button>
                    )}

                    {errorMessage && (
                        <Alert severity="error" style={{ marginTop: '1rem' }}>
                            {errorMessage}
                        </Alert>
                    )}
                </form>
            ) : (
                <CircularProgress />
            )}
        </Container>
    );
};

export default UserProfile;