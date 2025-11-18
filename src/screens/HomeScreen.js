import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getDailyTasks, updateTaskCompletion, markAllTasksCompleted } from '../services/taskService';
import TaskCard from '../components/TaskCard';
import { notifyTaskComplete, notifyAllTasksComplete } from '../services/notificationService';


const HomeScreen = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCompleted, setAllCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const dailyTasks = await getDailyTasks();
      setTasks(dailyTasks);
      
      const completed = dailyTasks.every(task => task.completed);
      setAllCompleted(completed);
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      setErrorMessage('Failed to load tasks. Please refresh.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId, completed) => {
  try {
    const updatedTasks = await updateTaskCompletion(taskId, !completed);
    if (updatedTasks) {
      setTasks(updatedTasks);
      const allDone = updatedTasks.every(task => task.completed);
      setAllCompleted(allDone);
      
      // Notify on task complete
      if (!completed) {
        await notifyTaskComplete();
      }
    }
  } catch (error) {
    console.error('❌ Error toggling task:', error);
  }
};


  const handleMarkAllCompleted = async () => {
  if (!allCompleted) {
    setErrorMessage('⚠️ Please complete all tasks first');
    setTimeout(() => setErrorMessage(''), 3000);
    return;
  }

  try {
    const result = await markAllTasksCompleted();
    
    if (result && result.success) {
      setSuccessMessage(`🎉 Amazing! All tasks completed!\n🔥 Streak: ${result.streak} ${result.streak === 1 ? 'day' : 'days'}`);
      
      // Send celebration notification
      await notifyAllTasksComplete(result.streak);
      
      setTimeout(() => {
        setSuccessMessage('');
        loadTasks();
      }, 3000);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading your daily tasks...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Please login</Text>
      </View>
    );
  }

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <View style={styles.container}>
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{user.username}!</Text>
        
        <View style={styles.streakContainer}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakNumber}>{user.currentStreak || 0}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }
            ]} 
          />
        </View>
      </View>

      {/* Success Message Banner */}
      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>{successMessage}</Text>
        </View>
      ) : null}

      {/* Error Message Banner */}
      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>Today's Wellness Tasks</Text>
        
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No tasks for today</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => handleTaskToggle(task.id, task.completed)}
            />
          ))
        )}

        <TouchableOpacity 
          style={[
            styles.completeButton,
            !allCompleted && styles.completeButtonDisabled
          ]}
          onPress={handleMarkAllCompleted}
          disabled={!allCompleted}
          activeOpacity={0.8}
        >
          <Text style={styles.completeButtonText}>
            {allCompleted ? '✓ Mark All Tasks Completed' : 'Complete All Tasks First'}
          </Text>
        </TouchableOpacity>

        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>💪</Text>
          <Text style={styles.motivationText}>
            {allCompleted 
              ? "Great job! Click the button above to complete today's wellness goals!"
              : `${totalCount - completedCount} task${totalCount - completedCount === 1 ? '' : 's'} remaining. You've got this!`
            }
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  welcomeHeader: {
    backgroundColor: '#2e7d32',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#e8f5e9',
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakLabel: {
    fontSize: 12,
    color: '#e8f5e9',
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2e7d32',
    borderRadius: 4,
  },
  successBanner: {
    backgroundColor: '#d4edda',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  successBannerText: {
    color: '#155724',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#f8d7da',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorBannerText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  completeButton: {
    backgroundColor: '#2e7d32',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  motivationCard: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  motivationEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    color: '#e65100',
    lineHeight: 20,
  },
});

export default HomeScreen;
