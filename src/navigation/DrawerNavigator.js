import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AuthContext } from '../context/AuthContext';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { user } = useContext(AuthContext);

  // Check if user has loaded
  if (!user) {
    return null; // Or loading screen
  }

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#f5f5f5',
        },
        drawerActiveTintColor: '#2e7d32',
        drawerInactiveTintColor: '#666',
        headerShown: false,
      }}
    >
      {user.role === 'admin' ? (
        // Admin sees only Dashboard
        <Drawer.Screen 
          name="Admin Dashboard" 
          component={AdminDashboardScreen}
          options={{
            title: 'Admin Dashboard',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2e7d32',
            },
            headerTintColor: '#fff',
          }}
        />
      ) : (
        // Teachers see Home, Calendar, and Profile
        <>
          <Drawer.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: 'Daily Tasks',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#2e7d32',
              },
              headerTintColor: '#fff',
            }}
          />
          <Drawer.Screen 
            name="Calendar" 
            component={CalendarScreen}
            options={{
              title: 'Task History',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#2e7d32',
              },
              headerTintColor: '#fff',
            }}
          />
          <Drawer.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              title: 'My Profile',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#2e7d32',
              },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
