import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { auth } from '../../firebase.config';
import { getCurrentUserData, logoutUser } from '../services/authService';

import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const data = await getCurrentUserData(userId);
      setUserData(data);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>WellEd</Text>
        <Text style={styles.drawerSubtitle}>{userData?.name}</Text>
        <Text style={styles.drawerEmail}>{userData?.email}</Text>
      </View>

      <View style={styles.drawerItems}>
        <TouchableOpacity 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('Home')}
        >
          <Text style={styles.drawerItemText}>🏠 Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('Calendar')}
        >
          <Text style={styles.drawerItemText}>📅 Calendar</Text>
        </TouchableOpacity>

        {userData?.isAdmin && (
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => props.navigation.navigate('AdminDashboard')}
          >
            <Text style={styles.drawerItemText}>👤 Admin Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const DrawerNavigator = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const data = await getCurrentUserData(userId);
      setUserData(data);
    }
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#4A90E2' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Calendar" component={CalendarScreen} />
      {userData?.isAdmin && (
        <Drawer.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      )}
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    backgroundColor: '#4A90E2',
    padding: 24,
    paddingTop: 60,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  drawerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  drawerEmail: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  drawerItems: {
    flex: 1,
    paddingTop: 24,
  },
  drawerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  drawerItemText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DrawerNavigator;
