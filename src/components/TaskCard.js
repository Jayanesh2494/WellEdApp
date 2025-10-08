import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TaskCard({ task, onToggle }) {
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

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View 
          style={[
            styles.categoryBadge, 
            { backgroundColor: getCategoryColor(task.category) }
          ]}
        >
          <Text style={styles.categoryText}>{task.category}</Text>
        </View>
        
        <TouchableOpacity onPress={onToggle}>
          <View style={[
            styles.checkbox,
            task.completed && styles.checkboxChecked
          ]}>
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.instruction}>{task.instruction}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // Fixed: Use boxShadow instead of shadow* props
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    // Keep these for mobile platforms
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
});
