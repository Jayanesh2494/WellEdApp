import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { getRandomTasks } from '../data/taskBank';

export const getDailyTasks = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const taskDocRef = doc(db, 'userTasks', `${userId}_${today}`);
    const taskDoc = await getDoc(taskDocRef);
    
    if (taskDoc.exists()) {
      return taskDoc.data().tasks;
    } else {
      const newTasks = getRandomTasks();
      await setDoc(taskDocRef, {
        userId,
        date: today,
        tasks: newTasks,
        allCompleted: false
      });
      return newTasks;
    }
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
};

export const updateTaskCompletion = async (userId, taskId, completed) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const taskDocRef = doc(db, 'userTasks', `${userId}_${today}`);
    const taskDoc = await getDoc(taskDocRef);
    
    if (taskDoc.exists()) {
      const tasks = taskDoc.data().tasks;
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      );
      
      await updateDoc(taskDocRef, { tasks: updatedTasks });
      return updatedTasks;
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
};

export const markAllTasksCompleted = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const taskDocRef = doc(db, 'userTasks', `${userId}_${today}`);
    const taskDoc = await getDoc(taskDocRef);
    
    if (taskDoc.exists()) {
      const tasks = taskDoc.data().tasks.map(task => ({ ...task, completed: true }));
      await updateDoc(taskDocRef, { 
        tasks, 
        allCompleted: true 
      });
      
      await updateUserStreak(userId);
      return tasks;
    }
  } catch (error) {
    console.error('Error marking all tasks:', error);
    return null;
  }
};

const updateUserStreak = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    
    const today = new Date().toISOString().split('T')[0];
    const lastDate = userData.lastCompletionDate;
    
    let newStreak = userData.streak || 0;
    
    if (!lastDate) {
      newStreak = 1;
    } else {
      const lastDateObj = new Date(lastDate);
      const todayObj = new Date(today);
      const diffTime = Math.abs(todayObj - lastDateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }
    
    await updateDoc(userDocRef, {
      streak: newStreak,
      lastCompletionDate: today
    });
  } catch (error) {
    console.error('Error updating streak:', error);
  }
};

export const getUserHistory = async (userId) => {
  try {
    const tasksCollection = collection(db, 'userTasks');
    const querySnapshot = await getDocs(tasksCollection);
    const history = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === userId) {
        history[data.date] = data.allCompleted;
      }
    });
    
    return history;
  } catch (error) {
    console.error('Error fetching history:', error);
    return {};
  }
};
