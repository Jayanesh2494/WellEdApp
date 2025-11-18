import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getTaskHistory } from '../services/taskService';

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState(null);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    const history = await getTaskHistory();
    const dates = {};
    
    Object.keys(history).forEach(date => {
      const dayData = history[date];
      dates[date] = {
        marked: true,
        dotColor: dayData.allCompleted ? '#2e7d32' : '#f44336',
        selected: false,
        selectedColor: dayData.allCompleted ? '#2e7d32' : '#f44336',
      };
    });
    
    setMarkedDates(dates);
    setLoading(false);
  };

  const handleDayPress = async (day) => {
    const history = await getTaskHistory();
    const dateData = history[day.dateString];
    
    // Update selected date
    const updatedDates = { ...markedDates };
    Object.keys(updatedDates).forEach(date => {
      updatedDates[date] = {
        ...updatedDates[date],
        selected: date === day.dateString
      };
    });
    
    setMarkedDates(updatedDates);
    setSelectedDate(day.dateString);
    setSelectedDateTasks(dateData || null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  const completedCount = selectedDateTasks?.tasks?.filter(t => t.completed).length || 0;
  const totalCount = selectedDateTasks?.tasks?.length || 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your Wellness Journey</Text>
      <Text style={styles.subtitle}>Track your daily progress</Text>
      
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        markingType={'dot'}
        theme={{
          selectedDayBackgroundColor: '#2e7d32',
          todayTextColor: '#2e7d32',
          arrowColor: '#2e7d32',
          dotColor: '#2e7d32',
          selectedDotColor: '#fff',
        }}
      />
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2e7d32' }]} />
          <Text style={styles.legendText}>All tasks completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f44336' }]} />
          <Text style={styles.legendText}>Incomplete day</Text>
        </View>
      </View>

      {selectedDate && (
        <View style={styles.selectedDateCard}>
          <Text style={styles.selectedDateTitle}>
            {new Date(selectedDate).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          
          {selectedDateTasks ? (
            <>
              <View style={styles.progressBar}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressCount}>
                    {completedCount}/{totalCount}
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { width: `${(completedCount / totalCount) * 100}%` }
                    ]}
                  />
                </View>
              </View>

              <View style={styles.tasksList}>
                {selectedDateTasks.tasks.map((task, index) => (
                  <View key={index} style={styles.taskItem}>
                    <View style={[
                      styles.taskCheckbox,
                      task.completed && styles.taskCheckboxCompleted
                    ]}>
                      {task.completed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.taskContent}>
                      <Text style={[
                        styles.taskCategory,
                        { color: getCategoryColor(task.category) }
                      ]}>
                        {task.category}
                      </Text>
                      <Text style={[
                        styles.taskText,
                        task.completed && styles.taskTextCompleted
                      ]}>
                        {task.instruction}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {selectedDateTasks.allCompleted && (
                <View style={styles.completedBanner}>
                  <Text style={styles.completedBannerText}>
                    🎉 All tasks completed on this day!
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataIcon}>📅</Text>
              <Text style={styles.noDataText}>No tasks for this date</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const getCategoryColor = (category) => {
  const colors = {
    Diet: '#4caf50',
    Exercise: '#2196f3',
    Posture: '#ff9800',
    Water: '#00bcd4',
    Sunlight: '#ffc107',
  };
  return colors[category] || '#9e9e9e';
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  legend: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDateCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  progressBar: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressCount: {
    fontSize: 14,
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
  tasksList: {
    marginTop: 8,
  },
  taskItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxCompleted: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
  },
  taskCategory: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  completedBanner: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    alignItems: 'center',
  },
  completedBannerText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
});
