import React, { useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const { user } = useContext(AuthContext);

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    
    if (!confirmed) return;
    
    try {
      console.log('🚪 Logging out...');
      
      // Clear all storage
      await AsyncStorage.clear();
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('✅ Storage cleared');
      
      // Redirect to login
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.username?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.usernameText}>{user.username}</Text>
        <Text style={styles.emailText}>{user.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Wellness Progress</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statNumber}>{user.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statNumber}>{user.longestStreak || 0}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
      </View>

     <TouchableOpacity onPress={() => logout(navigation)}>
      <Text>Logout</Text>
    </TouchableOpacity>

     
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: { 
    fontSize: 16, 
    color: '#666' 
  },
  header: { 
    backgroundColor: '#2e7d32', 
    padding: 30, 
    alignItems: 'center' 
  },
  avatarContainer: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  avatarText: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: '#2e7d32' 
  },
  usernameText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 4 
  },
  emailText: { 
    fontSize: 14, 
    color: '#e8f5e9' 
  },
  card: { 
    backgroundColor: '#fff', 
    margin: 16, 
    borderRadius: 12, 
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 16,
    color: '#333',
  },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  statCard: { 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5', 
    padding: 20, 
    borderRadius: 12, 
    flex: 1, 
    marginHorizontal: 6 
  },
  statIcon: { 
    fontSize: 32, 
    marginBottom: 8 
  },
  statNumber: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#2e7d32' 
  },
  statLabel: { 
    fontSize: 14, 
    color: '#666' 
  },
  logoutButton: { 
    backgroundColor: '#f44336', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sessionInfo: { 
    margin: 16, 
    marginTop: 0, 
    padding: 12, 
    backgroundColor: '#fff3e0', 
    borderRadius: 8, 
    borderLeftWidth: 4, 
    borderLeftColor: '#ff9800' 
  },
  sessionText: { 
    fontSize: 13, 
    color: '#e65100', 
    textAlign: 'center' 
  },
});

export default ProfileScreen;
