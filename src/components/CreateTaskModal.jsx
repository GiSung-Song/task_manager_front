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

const CreateTaskModal = ({open, closeModal}) => {
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        priority: "LOW",
        deadline: "",
        taskStatus: "PENDING",
    });

    const handleChange = (field, value) => {
        setNewTask({...newTask, [field]: value});
    };

    const createTask = async () => {
        try {
            await axios.post("/task", newTask);
            alert("Task created successfully.");
            closeModal();
        } catch (error) {
            console.error("Failed to create task:", error);
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
                    width: 400,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <TextField
                    label="Title"
                    value={newTask.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Description"
                    value={newTask.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    fullWidth
                    margin="dense"
                />
                <FormLabel>Priority</FormLabel>
                <RadioGroup
                    value={newTask.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                >
                    <FormControlLabel value="LOW" control={<Radio/>} label="Low"/>
                    <FormControlLabel value="MEDIUM" control={<Radio/>} label="Medium"/>
                    <FormControlLabel value="HIGH" control={<Radio/>} label="High"/>
                </RadioGroup>
                <TextField
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                    fullWidth
                    margin="dense"
                />
                <FormLabel>Status</FormLabel>
                <RadioGroup
                    value={newTask.taskStatus}
                    onChange={(e) => handleChange("taskStatus", e.target.value)}
                >
                    <FormControlLabel value="PENDING" control={<Radio/>} label="Pending"/>
                    <FormControlLabel value="PROGRESS" control={<Radio/>} label="In Progress"/>
                    <FormControlLabel value="COMPLETED" control={<Radio/>} label="Completed"/>
                </RadioGroup>
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