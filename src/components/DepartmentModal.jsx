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

const DepartmentModal = ({isVisible, close, onSelect}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState(null); // 에러 상태 추가

    // 부서 목록을 API에서 가져오는 함수
    const fetchDepartments = useCallback(async () => {
        try {
            const response = await axios.get('/departments');
            console.log("부서 목록 : ", response.data.data);

            if (Array.isArray(response.data.data)) {
                setDepartments(response.data.data);
                setError(null); // 에러가 없으면 에러 상태 초기화
            } else {
                console.error("부서 목록이 배열이 아닙니다.", response.data.data);
                setDepartments([]);
            }
        } catch (error) {
            console.error("부서 목록을 가져오는 데 실패했습니다.", error);
            setDepartments([]);
            setError('부서 목록을 가져오는 데 실패했습니다.'); // 에러 메시지 설정
        }
    }, []);

    // 컴포넌트가 표시될 때마다 부서 목록을 불러옴
    useEffect(() => {
        if (isVisible) {
            fetchDepartments();
        }
    }, [isVisible, fetchDepartments]);

    const handleSelectDepartment = (department) => {
        onSelect(department);
        close(); // 선택 후 모달 닫기
    };

    const filteredDepartments = departments.filter(department =>
        department && department.departmentName && department.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isVisible) return null;

    return (
        <Dialog open={isVisible} onClose={close} fullWidth maxWidth="sm">
            <DialogTitle>부서 선택</DialogTitle>
            <DialogContent>
                {error && <Typography color="error">{error}</Typography>}

                <TextField
                    label="부서 검색"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    margin="normal"
                />

                <List>
                    {filteredDepartments.length === 0 ? (
                        <ListItem>
                            <Typography>검색 결과가 없습니다.</Typography>
                        </ListItem>
                    ) : (
                        filteredDepartments.map((department) => (
                            <ListItem button key={department.id}
                                      onClick={() => handleSelectDepartment(department)}>
                                <ListItemText primary={department.departmentName}/>
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

export default DepartmentModal;