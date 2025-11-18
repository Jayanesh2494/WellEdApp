import api from './api';

export const getDailyTasks = async () => {
  try {
    console.log('📡 Fetching daily tasks from backend...');
    const response = await api.get('/tasks/daily');
    
    if (response.data.success) {
      console.log('✅ Tasks received:', response.data.tasks);
      return response.data.tasks;
    }
    return [];
  } catch (error) {
    console.error('❌ Error fetching tasks:', error.response?.data || error.message);
    return [];
  }
};

export const updateTaskCompletion = async (taskId, completed) => {
  try {
    console.log(`📝 Updating task ${taskId} to ${completed}`);
    const response = await api.put(`/tasks/daily/${taskId}`, { completed });
    
    if (response.data.success) {
      console.log('✅ Task updated successfully');
      return response.data.tasks;
    }
    return null;
  } catch (error) {
    console.error('❌ Error updating task:', error.response?.data || error.message);
    return null;
  }
};

export const markAllTasksCompleted = async () => {
  try {
    console.log('🎯 Marking all tasks as completed...');
    const response = await api.post('/tasks/complete');
    
    if (response.data.success) {
      console.log('✅ All tasks marked complete! Streak:', response.data.streak);
      return { success: true, streak: response.data.streak };
    }
    return { success: false };
  } catch (error) {
    console.error('❌ Error marking complete:', error.response?.data || error.message);
    return { success: false, message: error.response?.data?.error };
  }
};

export const getTaskHistory = async () => {
  try {
    const response = await api.get('/tasks/history');
    
    if (response.data.success) {
      const history = {};
      response.data.history.forEach(task => {
        history[task.date] = {
          allCompleted: task.allCompleted,
          tasks: task.tasks
        };
      });
      return history;
    }
    return {};
  } catch (error) {
    console.error('❌ Error fetching history:', error.response?.data || error.message);
    return {};
  }
};

export const getAllTeachers = async () => {
  try {
    const response = await api.get('/tasks/admin/teachers');
    
    if (response.data.success) {
      return response.data.teachers;
    }
    return [];
  } catch (error) {
    console.error('❌ Error fetching teachers:', error.response?.data || error.message);
    return [];
  }
};
