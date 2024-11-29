import {useEffect, useState} from "react";
import axios from "../services/axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"
import {Button, FormControlLabel, FormLabel, Radio, RadioGroup, TextField} from "@mui/material";
import CreateTaskModal from "../components/CreateTaskModal";

const MainPage = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasksByDate, setTasksByDate] = useState({});
    const [editingTask, setEditingTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('/task');
                const fetchData = response.data.data;
                setTasks(fetchData);
                groupTasksByDate(fetchData);
            } catch (error) {
                console.error('Failed to get tasks', error);
            }
        };

        fetchTasks()
            .then();
    }, []);

    const groupTasksByDate = (tasks) => {
        const grouped = tasks.reduce((acc, task) => {
            const dateKey = new Date(task.deadline).toDateString();
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(task);
            return acc;
        }, {});
        setTasksByDate(grouped);
    };

    const onDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleEditChange = (e, field) => {
        setEditingTask({...editingTask, [field]: e.target.value});
    };

    const saveTask = async () => {
        try {
            await axios.patch(`/task/${editingTask.taskId}`, editingTask);
            alert('해당 업무 일정을 수정했습니다.');
            setEditingTask(null);
            const updatedTasks = tasks.map((task) =>
                task.taskId === editingTask.taskId ? editingTask : task);

            setTasks(updatedTasks);
            groupTasksByDate(updatedTasks);
        } catch (error) {
            console.error("Update Fail : ", error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`/task/${taskId}`);
            alert('해당 업무를 삭제했습니다.');
            const updateTasks = tasks.filter((task) => task.taskId !== taskId);
            setTasks(updateTasks);
            groupTasksByDate(updateTasks);
        } catch (error) {
            console.error('delete fail : ', error);
        }
    };

    const renderTasksForDate = (date) => {
        const dateKey = date.toDateString();
        const dateTasks = tasksByDate[dateKey] || [];
        return (
            <div>
                {dateTasks.length === 0 ? (
                    <p>No tasks for this date.</p>
                ) : (
                    dateTasks.map((task, index) => (
                        <div key={task.taskId}>
                            {editingTask?.taskId === task.taskId ? (
                                <div>
                                    <TextField
                                        label="Title"
                                        value={editingTask.title}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Description"
                                        value={editingTask.description}
                                        onChange={(e) =>
                                            handleEditChange("description", e.target.value)
                                        }
                                        fullWidth
                                    />
                                    <FormLabel>Priority</FormLabel>
                                    <RadioGroup
                                        value={editingTask.priority}
                                        onChange={(e) => handleEditChange("priority", e.target.value)}
                                    >
                                        <FormControlLabel value="LOW" control={<Radio/>} label="Low"/>
                                        <FormControlLabel value="MEDIUM" control={<Radio/>} label="Medium"/>
                                        <FormControlLabel value="HIGH" control={<Radio/>} label="High"/>
                                    </RadioGroup>
                                    <TextField
                                        type="date"
                                        value={editingTask.deadline}
                                        onChange={(e) => handleEditChange("deadline", e.target.value)}
                                        fullWidth
                                    />
                                    <FormLabel>Status</FormLabel>
                                    <RadioGroup
                                        value={editingTask.taskStatus}
                                        onChange={(e) => handleEditChange("taskStatus", e.target.value)}
                                    >
                                        <FormControlLabel
                                            value="PENDING"
                                            control={<Radio/>}
                                            label="Pending"
                                        />
                                        <FormControlLabel
                                            value="PROGRESS"
                                            control={<Radio/>}
                                            label="In Progress"
                                        />
                                        <FormControlLabel
                                            value="COMPLETED"
                                            control={<Radio/>}
                                            label="Completed"
                                        />
                                    </RadioGroup>
                                    <Button variant="contained" color="primary" onClick={saveTask}>
                                        Save
                                    </Button>
                                    <Button onClick={() => setEditingTask(null)}>Cancel</Button>
                                </div>
                            ) : (
                                <div>
                                    <h4>{task.title}</h4>
                                    <p>{task.description}</p>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => setEditingTask(task)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => deleteTask(task.taskId)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        );
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div>
            <h1>Main Page</h1>
            <Button variant="contained" color="primary" onClick={openModal}>
                + Add Task
            </Button>
            <CreateTaskModal open={isModalOpen} closeModal={closeModal}/>
            <Calendar
                onChange={onDateChange}
                value={selectedDate}
                tileContent={({date}) => {
                    const dateKey = date.toDateString();
                    return tasksByDate[dateKey] ? <span>•</span> : null;
                }}
            />
            <h3>Selected Date: {selectedDate.toDateString()}</h3>
            {renderTasksForDate(selectedDate)}
        </div>
    );
};

export default MainPage;