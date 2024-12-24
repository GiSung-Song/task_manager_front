import React, {useState} from "react";
import {
    Modal,
    Box,
    TextField,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormLabel,
} from "@mui/material";
import axios from "../services/axios";
import {useSelector} from "react-redux";

const CreateTaskModal = ({open, closeModal}) => {
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        taskPriority: "LOW",
        startDate: "",
        deadline: "",
        taskStatus: "PENDING",
        taskType: "PERSONAL",
    });

    const level = useSelector((state) => state.auth.level);

    const [errors, setErrors] = useState({
        title: false,
        startDate: false,
        deadline: false,
    });

    const handleChange = (field, value) => {
        setNewTask((prev) => ({...prev, [field]: value}));
    };

    // 날짜를 로컬 시간대로 변환하는 함수
    const convertToLocalDateTime = (date) => {
        const dateTime = new Date(date);
        const localDateTime = new Date(dateTime.getTime() - dateTime.getTimezoneOffset() * 60000); //밀리초로 계산
        return localDateTime.toISOString(); // ISO 8601 형식으로 반환
    };

    const validateFields = () => {
        const newErrors = {
            title: !newTask.title.trim(),
            startDate: !newTask.startDate.trim(),
            deadline: !newTask.deadline.trim(),
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error);
    };

    const createTask = async () => {
        if (!validateFields()) {
            alert("Please fill out all required fields.");
            return;
        }

        try {
            const formattedTask = {
                ...newTask,
                startDate: convertToLocalDateTime(newTask.startDate),
                deadline: convertToLocalDateTime(newTask.deadline),
            };

            await axios.post("/task", formattedTask);
            alert("Task created successfully.");

            // 등록 후 상태 초기화
            setNewTask({
                title: "",
                description: "",
                taskPriority: "LOW",
                startDate: "",
                deadline: "",
                taskStatus: "PENDING",
                taskType: "PERSONAL",
            })

            closeModal();
        } catch (error) {
            console.error("Failed to create task : ", error);
            alert("Failed to create task");
        }
    };

    return (
        <Modal open={open} onClose={closeModal}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 500,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <FormLabel>Title</FormLabel>
                <TextField
                    label="Title"
                    value={newTask.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    fullWidth
                    margin="dense"
                    error={errors.title}
                    helperText={errors.title ? "Title is required." : ""}
                    sx={{marginBottom: 2}}
                />
                <FormLabel>Description</FormLabel>
                <TextField
                    label="Description"
                    value={newTask.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    fullWidth
                    margin="dense"
                    sx={{marginBottom: 2}}
                />
                <FormLabel>Priority</FormLabel>
                <RadioGroup
                    value={newTask.taskPriority}
                    onChange={(e) => handleChange("taskPriority", e.target.value)}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 2,
                    }}
                >
                    <FormControlLabel value="LOW" control={<Radio/>} label="Low"/>
                    <FormControlLabel value="MEDIUM" control={<Radio/>} label="Medium"/>
                    <FormControlLabel value="HIGH" control={<Radio/>} label="High"/>
                </RadioGroup>
                <FormLabel>Start Date</FormLabel>
                <TextField
                    type="date"
                    value={newTask.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    fullWidth
                    error={errors.startDate}
                    helperText={errors.startDate ? "Start Date is required." : ""}
                    sx={{marginBottom: 2}}
                />
                <FormLabel>Deadline</FormLabel>
                <TextField
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                    fullWidth
                    error={errors.deadline}
                    helperText={errors.deadline ? "Deadline is required." : ""}
                    sx={{marginBottom: 2}}
                />
                <FormLabel>Status</FormLabel>
                <RadioGroup
                    value={newTask.taskStatus}
                    onChange={(e) => handleChange("taskStatus", e.target.value)}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 2,
                    }}
                >
                    <FormControlLabel value="PENDING" control={<Radio/>} label="Pending"/>
                    <FormControlLabel value="PROGRESS" control={<Radio/>} label="In Progress"/>
                    <FormControlLabel value="COMPLETED" control={<Radio/>} label="Completed"/>
                </RadioGroup>
                {level >= 4 && (
                    <>
                        <FormLabel>Type</FormLabel>
                        <RadioGroup
                            value={newTask.taskType}
                            onChange={(e) => handleChange("taskType", e.target.value)}
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: 2,
                            }}
                        >
                            <FormControlLabel value="PERSONAL" control={<Radio/>} label="PERSONAL"/>
                            <FormControlLabel value="TEAM" control={<Radio/>} label="TEAM"/>
                        </RadioGroup>
                    </>
                )}
                <Box sx={{mt: 2, display: "flex", justifyContent: "space-between"}}>
                    <Button variant="contained" color="primary" onClick={createTask}>
                        Create
                    </Button>
                    <Button variant="outlined" onClick={closeModal}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default CreateTaskModal;