import React, {useState} from 'react';
import {useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import {useLogout} from "../utils/logoutUtils";

const NavBar = () => {
    const logoutHandler = useLogout();
    const navigate = useNavigate();

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
                alert('사원번호를 입력해주세요.')
                return;
            }

            window.open(`/profile/${employeeNumber}`, '_blank');
        } catch (error) {
            alert('사용자를 찾을 수 없습니다.');
        }
    };

    return (
        <nav>
            <ul>
                {isLoggedIn ? (
                    <>
                        <li><Link to={`/profile/${loggedInEmployeeNumber}`}>내 정보</Link></li>
                        <li><Link to='/'>홈</Link></li>
                        <li onClick={handleLogout} style={{ cursor: 'pointer' }}>로그아웃</li>

                        {/* HR 부서일 때만 검색 칸 보이기 */}
                        {department && department.startsWith('HR') && (
                            <li>
                                <input
                                    type="text"
                                    placeholder="사원번호로 검색"
                                    value={employeeNumber}
                                    onChange={(e) => setEmployeeNumber(e.target.value)}
                                />
                                <button onClick={handleSearch}>검색</button>
                            </li>
                        )}
                    </>
                ) : (
                    <li><Link to='/login'>로그인</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default NavBar;