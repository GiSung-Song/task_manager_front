import {useCallback, useEffect, useState} from "react";
import axios from "../services/axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
    Button,
    Box,
    TextField,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@mui/material";
import CreateTaskModal from "../components/CreateTaskModal";
import {useSelector} from "react-redux";
import EditTaskModal from "../components/EditTaskModal";

const MainPage = () => {
    const [activeStartDate, setActiveStartDate] = useState(new Date());
    const [selectedYearMonth, setSelectedYearMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasksByDate, setTasksByDate] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [taskIdToDelete, setTaskIdToDelete] = useState(null);

    const employeeNumber = useSelector((state) => state.auth.employeeNumber);
    const tasksPerPage = 1; // 한 페이지에 표시할 작업 개수

    // 주어진 날짜에 해당하는 월의 첫 번째와 마지막 날짜를 계산하는 함수
    const calculateMonthRange = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

        return {startDate, endDate};
    };

    // 주어진 날짜 범위에 해당하는 작업들을 불러오는 함수
    const fetchTasks = useCallback(async (startDate, endDate) => {
        try {
            const response = await axios.get("/task", {
                params: {startDate, endDate},
            });
            const fetchData = response.data.data;
            groupTasksByDate(fetchData); // 업무를 날짜별로 그룹화
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    }, []);

    // 작업을 날짜별로 그룹화하는 함수
    const groupTasksByDate = (tasks) => {
        const grouped = {};
        tasks.forEach((task) => {
            const startDate = new Date(task.startDate);
            const endDate = new Date(task.deadline);

            let currentDate = startDate;
            while (currentDate <= endDate) {
                const dateKey = currentDate.toDateString();

                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }
                grouped[dateKey].push(task);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });
        setTasksByDate(grouped); // 날짜별로 그룹화된 작업 상태를 업데이트
    };

    // 작업 삭제 함수
    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`/task/${taskId}`);
            alert("Task deleted successfully.");
            fetchTasks(...Object.values(calculateMonthRange(selectedDate))); // 삭제 후 데이터 갱신
        } catch (error) {
            alert("Failed to delete task");
            console.error("Failed to delete task", error);
        }
    };

    // 페이지 로드 시, 처음에 현재 날짜의 작업들을 불러오기 위해 호출되는 useEffect
    useEffect(() => {
        const {startDate, endDate} = calculateMonthRange(selectedYearMonth);
        fetchTasks(startDate, endDate);
    }, [selectedYearMonth, fetchTasks]);

    useEffect(() => {
        if (selectedDate && selectedDate.getTime() !== activeStartDate.getTime()) {
            setActiveStartDate(selectedDate);
        }
    }, [selectedDate, activeStartDate]);

    // 날짜를 선택했을 때 처리되는 함수
    const onDateChange = (date) => {
        // selectedDate 변경
        setSelectedDate(date);
        setCurrentPage(1);
    };

    // 이전 달 클릭 시
    const onPrevMonth = () => {
        const newDate = new Date(selectedDate);
        const currentMonth = newDate.getMonth();

        newDate.setMonth(newDate.getMonth() - 1);

        // 만약 이전 달의 달력에 없는 날짜면
        if (currentMonth === newDate.getMonth()) {
            newDate.setMonth(newDate.getMonth() - 1);
            newDate.setDate(new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate());
        }

        setSelectedDate(newDate); //현재 선택된 날짜 변경
        setSelectedYearMonth(newDate); //현재 조회하려는 날짜로 변경
    };

    // 다음 달 클릭 시
    const onNextMonth = () => {
        const newDate = new Date(selectedDate);
        const currentMonth = newDate.getMonth();

        newDate.setMonth(newDate.getMonth() + 1);

        // 만약 다음 달의 달력에 없는 날짜면 달이 두 번 올라가니까
        if (newDate.getMonth() === currentMonth + 2) {
            newDate.setMonth(newDate.getMonth() - 1);
            newDate.setDate(new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate());
        }

        setSelectedDate(newDate); //현재 선택된 날짜 변경
        setSelectedYearMonth(newDate); //현재 조회하려는 날짜로 변경
    };

    // 작업 생성 모달 열기
    const openCreateModal = () => setIsCreateModalOpen(true);

    // 작업 생성 모달 닫기
    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        const {startDate, endDate} = calculateMonthRange(selectedDate);
        fetchTasks(startDate, endDate);
    };

    // 작업 수정 모달 열기
    const openEditModal = () => setIsEditModalOpen(true);

    // 작업 수정 모달 닫기
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        const {startDate, endDate} = calculateMonthRange(selectedDate);
        fetchTasks(startDate, endDate);
    };

    // 삭제 확인 다이얼로그 열기
    const handleOpenDialog = (taskId) => {
        setTaskIdToDelete(taskId);
        setIsDialogOpen(true);
    };

    // 삭제 확인 다이얼로그 닫기
    const handleCloseDialog = () => {
        setTaskIdToDelete(null);
        setIsDialogOpen(false);
    };

    // 삭제 다이얼로그 컴포넌트
    const renderDeleteTaskDialog = () => {
        return (
            <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Delete Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you really want to delete this task ??
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            deleteTask(taskIdToDelete);
                            handleCloseDialog();
                        }}
                        color="primary"
                    >
                        Delete
                    </Button>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    // 선택한 날짜에 해당하는 작업을 페이지네이션에 맞게 표시하는 함수
    const renderTasksForDate = () => {
        const dateKey = selectedDate.toDateString();
        const dateTasks = tasksByDate[dateKey] || [];
        const paginatedTask = dateTasks[currentPage - 1];

        return (
            <div>
                {paginatedTask && (
                    <Box
                        key={paginatedTask.taskId}
                        sx={{
                            marginBottom: 2,
                            padding: 2,
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            maxWidth: "600px",
                        }}
                    >
                        <TextField
                            label="Title"
                            value={paginatedTask.title}
                            disabled
                            sx={{marginBottom: 1, width: "calc(100% - 24px)"}}
                        />
                        <TextField
                            label="Description"
                            value={paginatedTask.description}
                            disabled
                            sx={{marginBottom: 1, width: "calc(100% - 24px)"}}
                        />
                        <TextField
                            label="Priority"
                            value={paginatedTask.priority}
                            disabled
                            sx={{marginBottom: 1, width: "calc(100% - 24px)"}}
                        />
                        <TextField
                            label="Task Status"
                            value={paginatedTask.taskStatus}
                            disabled
                            sx={{marginBottom: 1, width: "calc(100% - 24px)"}}
                        />
                        <TextField
                            label="Start Date"
                            value={paginatedTask.startDate.split("T")[0]}
                            disabled
                            sx={{marginBottom: 1, width: "calc(100% - 24px)"}}
                        />
                        <TextField
                            label="Deadline"
                            value={paginatedTask.deadline.split("T")[0]}
                            disabled
                            sx={{marginBottom: 1, width: "calc(100% - 24px)"}}
                        />
                        <TextField
                            label="Task Type"
                            value={paginatedTask.taskType}
                            disabled
                            sx={{marginBottom: 1, width: "calc(100% - 24px)"}}
                        />
                        <TextField
                            label="Owner"
                            value={paginatedTask.owner}
                            disabled
                            sx={{marginBottom: 1, width: "calc(100% - 24px)"}}
                        />
                        <TextField
                            label="Department"
                            value={paginatedTask.department}
                            disabled
                            sx={{marginBottom: 1, width: "calc(100% - 24px)"}}
                        />
                        {paginatedTask.ownerEmployeeNumber === employeeNumber && (
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={openEditModal}
                                    sx={{marginRight: 1}}
                                >
                                    수정
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleOpenDialog(paginatedTask.taskId)}
                                >
                                    삭제
                                </Button>
                            </>
                        )}
                        {isEditModalOpen && paginatedTask && (
                            <EditTaskModal
                                open={isEditModalOpen}
                                closeModal={closeEditModal}
                                task={paginatedTask}
                            />
                        )}
                    </Box>
                )}
                {dateTasks.length > tasksPerPage && (
                    <Pagination
                        count={Math.ceil(dateTasks.length / tasksPerPage)}
                        page={currentPage}
                        onChange={(e, page) => setCurrentPage(page)}
                        sx={{marginTop: 2}}
                    />
                )}
            </div>
        );
    };

    return (
        <div>
            <Box position="absolute" top={100} left="27%">
                <Button variant="contained" color="primary" onClick={openCreateModal}>
                    + Add Task
                </Button>
            </Box>
            <CreateTaskModal open={isCreateModalOpen} closeModal={closeCreateModal}/>
            <Box>
                <Box position="absolute" top={160} left="15%">
                    <Button variant="outlined"
                            onClick={onPrevMonth}
                            sx={{
                                position: "absolute",
                                left: "-100px",
                                top: "50%",
                                transform: "translateY(-50%)",
                            }}>
                        {"<"}
                    </Button>
                    <Calendar
                        onChange={onDateChange}
                        value={selectedDate}
                        activeStartDate={activeStartDate}
                        onActiveStartDateChange={({activeStartDate}) => setActiveStartDate(activeStartDate)}
                        tileContent={({date}) => {
                            const dateKey = date.toDateString();
                            return tasksByDate[dateKey] ? (
                                <span style={{color: "blue", fontSize: "1.2rem"}}>•</span>
                            ) : null;
                        }}
                        onClickMonth={(date) => {
                            const newDate = new Date(date);
                            setSelectedDate(newDate);
                        }}
                        showNeighboringMonth={false}
                        next2Label={null}
                        prev2Label={null}
                        nextLabel={null}
                        prevLabel={null}
                    />
                    <Button variant="outlined"
                            onClick={onNextMonth}
                            sx={{
                                position: "absolute",
                                right: "-100px",
                                top: "50%",
                                transform: "translateY(-50%)",
                            }}>
                        {">"}
                    </Button>
                </Box>
                <Box position="absolute" top={80} left="50%">
                    <h3>
                        {selectedDate.toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            weekday: "long",
                        })}
                    </h3>
                </Box>
                <Box position="absolute" top={140} left="50%" marginTop={1}>
                    {renderTasksForDate()}
                </Box>
                {renderDeleteTaskDialog()}
            </Box>
        </div>
    );
};

export default MainPage;