import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "../services/axios";
import DepartmentModal from "../components/DepartmentModal";
import RoleModal from "../components/RoleModal";
import {Box, Button, TextField, Typography} from "@mui/material";
import {useSelector} from "react-redux";

const RegisterUser = () => {
    const [user, setUser] = useState({
        employeeNumber: "",
        password: "",
        username: "",
        phoneNumber: "",
        departmentId: null,
        roleId: null,  // 직급이 null로 시작
    });

    const [errors, setErrors] = useState({});
    const [confirmPassword, setConfirmPassword] = useState("");
    const [departmentName, setDepartmentName] = useState("");
    const [roleName, setRoleName] = useState("");

    const [isDepartmentModalVisible, setIsDepartmentModalVisible] = useState(false);
    const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);

    const navigate = useNavigate();

    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

    // 로그인된 상태이면 메인 페이지로 리디렉션
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    // 전화번호 검증
    const validatePhoneNumber = (phoneNumber) => {
        const phoneNumberPattern = /^[0-9]{10,11}$/;
        if (!phoneNumberPattern.test(phoneNumber)) {
            return "Phone Number must be 10 or 11 digits.";
        }
        return "";
    };

    const handlePhoneNumber = (e) => {
        const value = e.target.value;
        const numericValue = value.replace(/[^0-9]/g, "");

        setUser((prevUser) => ({
            ...prevUser,
            phoneNumber: numericValue,
        }));

        const error = validatePhoneNumber(numericValue);
        setErrors((prevErrors) => ({
            ...prevErrors,
            phoneNumber: error,
        }));
    };

    // 비밀번호 검증
    const validatePassword = () => {
        const password = user.password;
        const minLength = 8;
        const specialCharacterPattern = /[!@#$%^&*(),.?":{}|<>]/;

        let tempErrors = {};

        if (password.length < minLength) {
            tempErrors.password = "Password must be at least 8 characters.";
        } else if (!specialCharacterPattern.test(password)) {
            tempErrors.password = "Password must contain at least one special character.";
        } else if (password !== confirmPassword) {
            tempErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors((prevErrors) => ({...prevErrors, ...tempErrors}));
        return Object.keys(tempErrors).length === 0;  // 에러 없으면 true 반환
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        console.log(user);

        setErrors({});  // 에러 초기화

        // 비밀번호 확인 후 유효성 검사
        const isValidPassword = validatePassword();
        if (!isValidPassword) return;

        // 전화번호 검증
        const phoneError = validatePhoneNumber(user.phoneNumber);
        if (phoneError) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                phoneNumber: phoneError,
            }));
            return;
        }

        // 직급 선택 확인
        if (!user.roleId) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                roleId: "Role is required",  // 직급 선택 안되었을 때 오류 메시지 추가
            }));
            return;
        }

        try {
            await axios.post("/users", user);

            alert("회원가입에 성공했습니다.");
            navigate("/login");
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrors(error.response.data);
            } else {
                alert(error.response?.data?.error || "회원가입에 실패했습니다. 다시 시도해주세요.");
            }
        }
    };

    const openDepartmentModal = () => setIsDepartmentModalVisible(true);
    const closeDepartmentModal = () => setIsDepartmentModalVisible(false);

    const selectDepartment = (department) => {
        setUser((prevUser) => ({
            ...prevUser,
            departmentId: department.id,
        }));
        setDepartmentName(department.departmentName);
        setErrors((prevErrors) => ({...prevErrors, departmentId: ""}));
        closeDepartmentModal();
    };

    const openRoleModal = () => setIsRoleModalVisible(true);
    const closeRoleModal = () => setIsRoleModalVisible(false);

    const selectRole = (role) => {
        setUser((prevUser) => ({
            ...prevUser,
            roleId: role.id,
        }));
        setRoleName(role.roleName);
        setErrors((prevErrors) => ({...prevErrors, roleId: ""}));  // 직급 선택 후 오류 초기화
        closeRoleModal();
    };

    return (
        <Box sx={{maxWidth: 400, margin: "0 auto", padding: 4, position: "relative", top: 100}}>
            <Typography variant="h4" gutterBottom>
                회원가입
            </Typography>
            <form onSubmit={handleRegister}>
                <TextField
                    label="사원번호"
                    fullWidth
                    margin="normal"
                    value={user.employeeNumber}
                    onChange={(e) => {
                        setUser({...user, employeeNumber: e.target.value});
                        setErrors((prevErrors) => ({...prevErrors, employeeNumber: ""}));
                    }}
                    error={!!errors.employeeNumber}
                    helperText={errors.employeeNumber}
                />
                <TextField
                    label="비밀번호"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={user.password}
                    onChange={(e) => {
                        setUser({...user, password: e.target.value});
                        setErrors((prevErrors) => ({...prevErrors, password: ""}));
                    }}
                    error={!!errors.password}
                    helperText={errors.password}
                />
                <TextField
                    label="비밀번호 확인"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors((prevErrors) => ({...prevErrors, confirmPassword: ""}));
                    }}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                />
                <TextField
                    label="이름"
                    fullWidth
                    margin="normal"
                    value={user.username}
                    onChange={(e) => {
                        setUser({...user, username: e.target.value});
                        setErrors((prevErrors) => ({...prevErrors, username: ""}));
                    }}
                    error={!!errors.username}
                    helperText={errors.username}
                />
                <TextField
                    label="전화번호"
                    fullWidth
                    margin="normal"
                    value={user.phoneNumber}
                    onChange={handlePhoneNumber}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                />
                <TextField
                    label="부서명"
                    fullWidth
                    margin="normal"
                    value={departmentName}
                    onClick={openDepartmentModal}
                    readOnly
                    error={!!errors.departmentId}
                    helperText={errors.departmentId}
                />
                <TextField
                    label="직급"
                    fullWidth
                    margin="normal"
                    value={roleName}
                    onClick={openRoleModal}
                    readOnly
                    error={!!errors.roleId}
                    helperText={errors.roleId}  // 직급 선택 오류 메시지 처리
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    type="submit"
                    sx={{mt: 2}}
                >
                    회원가입
                </Button>
            </form>
            <DepartmentModal
                isVisible={isDepartmentModalVisible}
                close={closeDepartmentModal}
                onSelect={selectDepartment}
            />
            <RoleModal
                isVisible={isRoleModalVisible}
                close={closeRoleModal}
                onSelect={selectRole}
            />
        </Box>
    );
};

export default RegisterUser;