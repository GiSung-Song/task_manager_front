import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Typography
} from "@mui/material";
import {useCallback, useEffect, useState} from "react";
import axios from "../services/axios";

const RoleModal = ({isVisible, close, onSelect}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState(null); // 에러 상태 추가

    // 직급 목록을 API에서 가져오는 함수
    const fetchRoles = useCallback(async () => {
        try {
            const response = await axios.get('/roles');
            console.log("직급 목록: ", response.data.data);

            if (Array.isArray(response.data.data)) {
                setRoles(response.data.data);
                setError(null); // 에러가 없으면 에러 상태 초기화
            } else {
                console.error("직급 목록이 배열이 아닙니다.", response.data.data);
                setRoles([]);
            }
        } catch (error) {
            console.error("직급 목록을 가져오는 데 실패했습니다.", error);
            setRoles([]);
            setError('직급 목록을 가져오는 데 실패했습니다.'); // 에러 메시지 설정
        }
    }, []);

    // 컴포넌트가 표시될 때마다 직급 목록을 불러옴
    useEffect(() => {
        if (isVisible) {
            fetchRoles();
        }
    }, [isVisible, fetchRoles]);

    const handleSelectRole = (role) => {
        onSelect(role);
        close(); // 선택 후 모달 닫기
    };

    const filteredRoles = roles.filter(role =>
        role && role.roleName && role.roleName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isVisible) return null;

    return (
        <Dialog open={isVisible} onClose={close} fullWidth maxWidth="sm">
            <DialogTitle>직급 선택</DialogTitle>
            <DialogContent>
                {error && <Typography color="error">{error}</Typography>}

                <TextField
                    label="직급 검색"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    margin="normal"
                />

                <List>
                    {filteredRoles.length === 0 ? (
                        <ListItem>
                            <Typography>검색 결과가 없습니다.</Typography>
                        </ListItem>
                    ) : (
                        filteredRoles.map((role) => (
                            <ListItem button key={role.id}
                                      onClick={() => handleSelectRole(role)}>
                                <ListItemText primary={role.roleName}/>
                            </ListItem>
                        ))
                    )}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="primary">
                    닫기
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoleModal;