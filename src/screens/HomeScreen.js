import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  StyleSheet, Alert, RefreshControl 
} from 'react-native';
import { auth } from '../../firebase.config';
import { getDailyTasks, updateTaskCompletion, markAllTasksCompleted } from '../services/taskService';
import { getCurrentUserData } from '../services/authService';
import TaskCard from '../components/TaskCard';

const HomeScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const [userTasks, userInfo] = await Promise.all([
        getDailyTasks(userId),
        getCurrentUserData(userId)
      ]);
      setTasks(userTasks);
      setUserData(userInfo);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleTask = async (taskId, completed) => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const updatedTasks = await updateTaskCompletion(userId, taskId, completed);
      if (updatedTasks) {
        setTasks(updatedTasks);
      }
    }
  };

  const handleMarkAllCompleted = async () => {
    const allCompleted = tasks.every(task => task.completed);
    
    if (allCompleted) {
      Alert.alert('Info', 'All tasks are already completed!');
      return;
    }

    Alert.alert(
      'Complete All Tasks',
      'Mark all tasks as completed for today?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            const userId = auth.currentUser?.uid;
            if (userId) {
              const completed = await markAllTasksCompleted(userId);
              if (completed) {
                setTasks(completed);
                await loadData();
                Alert.alert('Success', 'All tasks completed! Streak updated.');
              }
            }
          }
        }
      ]
    );
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {userData?.name || 'Teacher'}!</Text>
        <View style={styles.streakContainer}>
          <Text style={styles.streakNumber}>{userData?.streak || 0}</Text>
          <Text style={styles.streakLabel}>Day Streak 🔥</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {completedCount} of {totalTasks} tasks completed
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(completedCount / totalTasks) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <ScrollView
        style={styles.taskList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Today's Wellness Tasks</Text>
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onToggle={handleToggleTask}
          />
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.completeButton}
        onPress={handleMarkAllCompleted}
      >
        <Text style={styles.completeButtonText}>Mark All Tasks Completed</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  streakLabel: {
    fontSize: 16,
    color: '#fff',
  },
  progressContainer: {
    padding: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    margin: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
