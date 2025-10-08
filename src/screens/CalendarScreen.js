import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { auth } from '../../firebase.config';
import { getUserHistory } from '../services/taskService';

const CalendarScreen = () => {
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const history = await getUserHistory(userId);
      const marked = {};
      
      Object.keys(history).forEach(date => {
        marked[date] = {
          selected: true,
          selectedColor: history[date] ? '#4CAF50' : '#F44336',
        };
      });
      
      setMarkedDates(marked);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Missed</Text>
          </View>
        </View>
      </View>

      <Calendar
        markedDates={markedDates}
        theme={{
          todayTextColor: '#4A90E2',
          arrowColor: '#4A90E2',
          monthTextColor: '#333',
          textMonthFontWeight: 'bold',
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
});

export default CalendarScreen;
