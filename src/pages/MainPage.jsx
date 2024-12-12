import {useEffect, useState} from "react";
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
    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasksByDate, setTasksByDate] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [taskIdToDelete, setTaskIdToDelete] = useState(null);

    const employeeNumber = useSelector((state) => state.auth.employeeNumber);
    const tasksPerPage = 1;

    const calculateMonthRange = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

        return {startDate, endDate};
    };

    const fetchTasks = async (startDate, endDate) => {
        try {
            const response = await axios.get("/task", {
                params: {startDate, endDate},
            });
            const fetchData = response.data.data;
            setTasks(fetchData);
            groupTasksByDate(fetchData);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    };

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
        setTasksByDate(grouped);
    };

    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`/task/${taskId}`);
            alert("Task deleted successfully.");

            // 삭제 후 데이터 갱신
            fetchTasks(...Object.values(calculateMonthRange(selectedDate)));
        } catch (error) {
            alert("Failed to delete task");
            console.error("Failed to delete task", error);
        }
    };

    useEffect(() => {
        const {startDate, endDate} = calculateMonthRange(selectedDate);
        fetchTasks(startDate, endDate);
    }, []);

    const onDateChange = (date) => {
        setSelectedDate(date);
        setCurrentPage(1);
    };

    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => {
        setIsCreateModalOpen(false);

        const {startDate, endDate} = calculateMonthRange(selectedDate);
        fetchTasks(startDate, endDate);
    };

    const openEditModal = () => setIsEditModalOpen(true);
    const closeEditModal = () => {
        setIsEditModalOpen(false);

        const {startDate, endDate} = calculateMonthRange(selectedDate);
        fetchTasks(startDate, endDate);
    };

    const handleOpenDialog = (taskId) => {
        setTaskIdToDelete(taskId);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setTaskIdToDelete(null); // 상태 초기화
        setIsDialogOpen(false);
    };

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
                    <Calendar
                        onChange={onDateChange}
                        value={selectedDate}
                        tileContent={({date}) => {
                            const dateKey = date.toDateString();
                            return tasksByDate[dateKey] ? (
                                <span style={{color: "blue", fontSize: "1.2rem"}}>•</span>
                            ) : null;
                        }}
                    />
                </Box>
                <Box position="absolute" top={80} left="40%">
                    <h3>
                        {selectedDate.toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            weekday: "long",
                        })}
                    </h3>
                </Box>
                <Box position="absolute" top={140} left="40%" marginTop={1}>
                    {renderTasksForDate()}
                </Box>
                {renderDeleteTaskDialog()}
            </Box>
        </div>
    );
};

export default MainPage;