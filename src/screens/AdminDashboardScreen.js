import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, RefreshControl 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getAllTeachers } from '../services/taskService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminDashboardScreen() {
  const { user } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalTeachers: 0, activeToday: 0, totalStreaks: 0 });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const teacherData = await getAllTeachers();
      
      const activeCount = teacherData.filter(t => t.completedToday).length;
      const totalStreakCount = teacherData.reduce((sum, t) => sum + (t.currentStreak || 0), 0);
      
      teacherData.sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));
      
      setTeachers(teacherData);
      setStats({
        totalTeachers: teacherData.length,
        activeToday: activeCount,
        totalStreaks: totalStreakCount
      });
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async (navigation) => {
  // Confirm logout only on web
  const confirmed = typeof window !== 'undefined' ? window.confirm('Are you sure you want to logout?') : true;
  
  if (!confirmed) return;

  try {
    console.log('🚪 Admin logging out...');

    // Clear AsyncStorage on native
    await AsyncStorage.clear();

    // Clear local and session storage on web
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();

      // Redirect to login page after clearing
      window.location.href = '/';
      return; // Stop here for web
    }

    // On native, reset navigation stack to Login screen
    if (navigation) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    }

    console.log('✅ Storage cleared and navigation reset!');
  } catch (error) {
    console.error('Logout error:', error);

    // Fallback navigation reset on native in case of error
    if (navigation) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    }

    // On web fallback - reload
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
};

  const renderHeader = () => (
    <View>
      <View style={styles.summaryContainer}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.dashboardTitle}>Admin Dashboard</Text>
            <Text style={styles.dashboardSubtitle}>Teacher Overview</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statNumber}>{stats.totalTeachers}</Text>
            <Text style={styles.statLabel}>Teachers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statNumber}>{stats.activeToday}</Text>
            <Text style={styles.statLabel}>Active Today</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statNumber}>{stats.totalStreaks}</Text>
            <Text style={styles.statLabel}>Total Streaks</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statNumber}>
              {stats.totalTeachers > 0 ? Math.round((stats.activeToday / stats.totalTeachers) * 100) : 0}%
            </Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.listTitle}>Teacher Leaderboard</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👨‍🏫</Text>
      <Text style={styles.emptyText}>No teachers registered yet</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={teachers}
      renderItem={({ item, index }) => (
        <View style={styles.teacherCard}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
          <View style={styles.teacherInfo}>
            <View style={styles.teacherHeader}>
              <Text style={styles.teacherName}>{item.username}</Text>
              {item.completedToday && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.teacherEmail}>{item.email}</Text>
            <View style={styles.streakRow}>
              <Text style={styles.streakLabel}>Current: {item.currentStreak || 0} days</Text>
              <Text style={styles.streakLabel}>• Best: {item.longestStreak || 0} days</Text>
            </View>
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.fireIcon}>🔥</Text>
            <Text style={styles.streakNumber}>{item.currentStreak || 0}</Text>
          </View>
        </View>
      )}
      keyExtractor={item => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={() => { 
            setRefreshing(true); 
            loadTeachers(); 
          }} 
          colors={['#2e7d32']}
          tintColor="#2e7d32"
        />
      }
      style={styles.container}
      contentContainerStyle={teachers.length === 0 ? styles.emptyListContainer : null}
    />
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  summaryContainer: { 
    backgroundColor: '#2e7d32', 
    padding: 20 
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20,
    alignItems: 'flex-start'
  },
  dashboardTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  dashboardSubtitle: { 
    fontSize: 14, 
    color: '#e8f5e9', 
    marginTop: 4 
  },
  logoutButton: { 
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  logoutText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  statBox: { 
    width: '48%', 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 12 
  },
  statIcon: { 
    fontSize: 28, 
    marginBottom: 8 
  },
  statNumber: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#e8f5e9',
    textAlign: 'center'
  },
  listTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    padding: 20, 
    paddingBottom: 12,
    color: '#333'
  },
  teacherCard: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    marginHorizontal: 16, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankBadge: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#f5f5f5', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  rankText: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#666' 
  },
  teacherInfo: { 
    flex: 1 
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  teacherName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginRight: 8,
    color: '#333'
  },
  completedBadge: {
    backgroundColor: '#4caf50',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  teacherEmail: { 
    fontSize: 13, 
    color: '#666',
    marginBottom: 6
  },
  streakRow: {
    flexDirection: 'row',
    gap: 8
  },
  streakLabel: {
    fontSize: 12,
    color: '#999'
  },
  streakInfo: { 
    backgroundColor: '#fff3e0', 
    padding: 12, 
    borderRadius: 12, 
    minWidth: 60, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff9800'
  },
  fireIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  streakNumber: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#ff5722' 
  },
  emptyListContainer: {
    flexGrow: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  }
});
