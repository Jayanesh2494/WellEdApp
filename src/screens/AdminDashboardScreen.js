import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, 
  TouchableOpacity, Alert 
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.config';

const AdminDashboardScreen = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const teachersList = [];
      
      userSnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.isAdmin) {
          teachersList.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      setTeachers(teachersList);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load teachers');
      setLoading(false);
    }
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Export functionality would generate a CSV or PDF report',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportData}>
          <Text style={styles.exportButtonText}>Export Report</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          teachers.map(teacher => (
            <View key={teacher.id} style={styles.teacherCard}>
              <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>{teacher.name}</Text>
                <Text style={styles.teacherEmail}>{teacher.email}</Text>
              </View>
              <View style={styles.teacherStats}>
                <View style={styles.statBadge}>
                  <Text style={styles.statNumber}>{teacher.streak || 0}</Text>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
                <View style={styles.statusIndicator}>
                  <Text style={styles.statusText}>
                    {teacher.lastCompletionDate === new Date().toISOString().split('T')[0] 
                      ? '✓' : '○'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  exportButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    padding: 24,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 32,
  },
  teacherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 14,
    color: '#666',
  },
  teacherStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    color: '#4CAF50',
  },
});

export default AdminDashboardScreen;
