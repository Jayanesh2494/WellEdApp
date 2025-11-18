import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

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

  const getCategoryImage = (category) => {
    const images = {
      Diet: require('../../assets/diet.jpg'),
      Exercise: require('../../assets/exercise.jpg'),
      Posture: require('../../assets/posture.jpg'),
      Water: require('../../assets/water.jpg'),
      Sunlight: require('../../assets/sunlight.jpg'),
    };
    return images[category] || images.Diet;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        task.completed && styles.cardCompleted
      ]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      {/* Small Category Image on Left */}
      <View style={styles.imageContainer}>
        <Image 
          source={getCategoryImage(task.category)}
          style={styles.categoryImage}
          resizeMode="cover"
        />
        {task.completed && (
          <View style={styles.completedOverlay}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
      
      {/* Content on Right */}
      <View style={styles.cardContent}>
        <View 
          style={[
            styles.categoryBadge, 
            { backgroundColor: getCategoryColor(task.category) }
          ]}
        >
          <Text style={styles.categoryIcon}>{task.emoji}</Text>
          <Text style={styles.categoryText}>{task.category}</Text>
        </View>

        <Text style={[
          styles.instruction,
          task.completed && styles.instructionCompleted
        ]}>
          {task.instruction}
        </Text>

        <Text style={[
          styles.status,
          task.completed && styles.statusCompleted
        ]}>
          {task.completed ? '✓ Done' : 'Tap to complete'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardCompleted: {
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    width: 90,
    height: 90,
    position: 'relative',
    backgroundColor: '#e0e0e0',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(46, 125, 50, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
  },
  instruction: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  instructionCompleted: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  status: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  statusCompleted: {
    color: '#4caf50',
  },
});
