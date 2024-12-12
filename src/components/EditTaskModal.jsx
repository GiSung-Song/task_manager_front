import React, {useEffect, useState} from "react";
import axios from "../services/axios";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    FormLabel,
    Modal,
    Radio,
    RadioGroup,
    TextField
} from "@mui/material";

const EditTaskModal = ({open, closeModal, task}) => {
    const [editTask, setEditTask] = useState(task);
    const [errors, setErrors] = useState({
        priority: false,
        deadline: false,
        taskStatus: false,
    });
    const [isOpenDialog, setIsOpenDialog] = useState(false);

    useEffect(() => {
        if (task) {
            setEditTask(task);
        }
    }, [task]);

    const handleChange = (field, value) => {
        setEditTask((prev) => ({...prev, [field] : value}));
    };

    // 날짜를 로컬 시간대로 변환하는 함수
    const convertToLocalDateTime = (date) => {
        const dateTime = new Date(date);
        const localDateTime = new Date(dateTime.getTime() - dateTime.getTimezoneOffset() * 60000); //밀리초로 계산
        return localDateTime.toISOString(); // ISO 8601 형식으로 반환
    };

    const validateFields = () => {
        const newErrors = {
            priority: !editTask.priority,
            deadline: !editTask.deadline,
            taskStatus: !editTask.taskStatus,
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error);
    };

    const editSaveTask = async () => {
        if (!validateFields()) {
            alert("Please fill out all required fields.");
            return;
        }

        try {
            const formattedTask = {
                ...editTask,
                deadline: convertToLocalDateTime(editTask.deadline),
            };

            await axios.patch(`/task/${editTask.taskId}`, formattedTask);
            alert("Task edit successfully");
            handleCloseDialog();
            closeModal();
        } catch (error) {
            console.error("Failed to edit task : ", error);
            alert("Failed to edit task");
        }
    };

    const handleOpenDialog = () => {
        setIsOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setIsOpenDialog(false);
    };

    const renderConfirmDialog = () => {
        return (
            <Dialog open={isOpenDialog} onClose={handleCloseDialog}>
                <DialogTitle>Edit Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you really want to edit this task ??
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            editSaveTask();
                        }}
                        color="primary"
                    >
                        Edit
                    </Button>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
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
                    overflow: "visible",
                }}
            >
                <FormLabel>Title</FormLabel>
                <TextField
                    label="Title"
                    value={editTask.title}
                    fullWidth
                    margin="dense"
                    sx={{marginBottom: 2}}
                    disabled={true}
                />
                <FormLabel>Description</FormLabel>
                <TextField
                    label="Description"
                    value={editTask.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    fullWidth
                    margin="dense"
                    sx={{marginBottom: 2}}
                />
                <FormLabel>Priority</FormLabel>
                <RadioGroup
                    value={editTask.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
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
                    value={editTask.startDate.split("T")[0]}
                    fullWidth
                    sx={{marginBottom: 2}}
                    disabled={true}
                />
                <FormLabel>Deadline</FormLabel>
                <TextField
                    type="date"
                    value={editTask.deadline.split("T")[0]}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                    fullWidth
                    error={errors.deadline}
                    helperText={errors.deadline ? "Deadline is required." : ""}
                    sx={{marginBottom: 2}}
                />
                <FormLabel>Status</FormLabel>
                <RadioGroup
                    value={editTask.taskStatus}
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
                <Box sx={{mt: 2, display: "flex", justifyContent: "space-between"}}>
                    <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
                        Edit
                    </Button>
                    <Button variant="outlined" onClick={closeModal}>
                        Cancel
                    </Button>
                </Box>
                {renderConfirmDialog()}
            </Box>
        </Modal>
    );
}

export default EditTaskModal;