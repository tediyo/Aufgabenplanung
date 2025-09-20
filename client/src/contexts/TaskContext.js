import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { tasksAPI } from '../utils/api';
import toast from 'react-hot-toast';

const TaskContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task._id === action.payload._id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload),
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  filters: {
    status: '',
    category: '',
    priority: '',
    timeFrame: '',
    search: '',
    startDate: '',
    endDate: '',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasNext: false,
    hasPrev: false,
  },
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await tasksAPI.getTasks({
        ...state.filters,
        ...params,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      });

      dispatch({ type: 'SET_TASKS', payload: response.data.tasks });
      dispatch({ type: 'SET_PAGINATION', payload: response.data.pagination });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch tasks';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await tasksAPI.createTask(taskData);
      dispatch({ type: 'ADD_TASK', payload: response.data.task });
      toast.success('Task created successfully!');
      return { success: true, task: response.data.task };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const response = await tasksAPI.updateTask(id, taskData);
      dispatch({ type: 'UPDATE_TASK', payload: response.data.task });
      toast.success('Task updated successfully!');
      return { success: true, task: response.data.task };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const deleteTask = async (id) => {
    try {
      await tasksAPI.deleteTask(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
      toast.success('Task deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete task';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const startTimer = async (id, description = '') => {
    try {
      await tasksAPI.startTimer(id, description);
      toast.success('Timer started!');
      // Refresh the task to get updated time tracking data
      const response = await tasksAPI.getTask(id);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start timer';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const stopTimer = async (id) => {
    try {
      await tasksAPI.stopTimer(id);
      toast.success('Timer stopped!');
      // Refresh the task to get updated time tracking data
      const response = await tasksAPI.getTask(id);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to stop timer';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setSorting = (sortBy, sortOrder) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // Update state and refetch tasks
    fetchTasks({ sortBy, sortOrder });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const value = {
    ...state,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    startTimer,
    stopTimer,
    setFilters,
    setSorting,
    clearError,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};



