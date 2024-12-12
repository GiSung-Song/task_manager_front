import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../utils/logoutUtils";
import { AppBar, Toolbar, Button, TextField, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const NavBar = () => {
    const logoutHandler = useLogout();
    const navigate = useNavigate();
    const location = useLocation();

    // Redux 로그인 상태 가져오기
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const { employeeNumber: loggedInEmployeeNumber, department } = useSelector((state) => state.auth);

    const [employeeNumber, setEmployeeNumber] = useState('');

    // 로그아웃
    const handleLogout = async () => {
        try {
            // 로그아웃 백엔드 api 호출
            await logoutHandler();
            alert('로그아웃 했습니다.');
            navigate('/login');
        } catch (error) {
            alert('로그아웃 실패 : ' + error.message);
        }
    };

    const handleSearch = async () => {
        try {
            if (!employeeNumber) {
                alert('사원번호를 입력해주세요.');
                return;
            }

            window.open(`/profile/${employeeNumber}`, '_blank');
        } catch (error) {
            alert('사용자를 찾을 수 없습니다.');
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <AppBar position="fixed">
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isLoggedIn ? (
                        <>
                            <Button
                                color={isActive(`/profile/${loggedInEmployeeNumber}`) ? "secondary" : "inherit"}
                                component={Link}
                                sx={{
                                    fontSize: isActive(`/profile/${loggedInEmployeeNumber}`) ? '1.4rem' : '1.2rem', // 활성화된 버튼 글씨 크기
                                    fontWeight: isActive(`/profile/${loggedInEmployeeNumber}`) ? 'bold' : 'normal', // 활성화된 버튼 굵기
                                    color: isActive(`/profile/${loggedInEmployeeNumber}`) ? 'white' : 'rgba(255, 255, 255, 0.7)', // 활성화된 색상
                                }}
                                to={`/profile/${loggedInEmployeeNumber}`}
                            >
                                내 정보
                            </Button>
                            <Button
                                color={isActive('/') ? "secondary" : "inherit"}
                                component={Link}
                                sx={{
                                    fontSize: isActive('/') ? '1.4rem' : '1.2rem', // 활성화된 버튼 글씨 크기
                                    fontWeight: isActive('/') ? 'bold' : 'normal', // 활성화된 버튼 굵기
                                    color: isActive('/') ? 'white' : 'rgba(255, 255, 255, 0.7)', // 활성화된 색상
                                }}
                                to='/'
                            >
                                홈
                            </Button>
                            <Button
                                color="inherit"
                                onClick={handleLogout}
                                sx={{
                                    fontSize: '1.2rem',
                                    color: 'rgba(255, 255, 255, 0.7)', // 기본 색상
                                }}
                            >
                                로그아웃
                            </Button>
                        </>
                    ) : (
                        <Button
                            color="inherit"
                            component={Link}
                            to='/login'
                            sx={{
                                fontSize: '1.2rem',
                                color: 'rgba(255, 255, 255, 0.7)', // 기본 색상
                            }}
                        >
                            로그인
                        </Button>
                    )}
                </Box>

                {/* HR 부서일 때만 검색 칸 보이기 */}
                {department && department.startsWith('HR') && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="사원번호로 검색"
                            value={employeeNumber}
                            onChange={(e) => setEmployeeNumber(e.target.value)}
                            sx={{
                                marginRight: '1rem',
                                backgroundColor: 'white',
                            }}
                        />
                        <IconButton color="inherit" onClick={handleSearch}>
                            <SearchIcon />
                        </IconButton>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;