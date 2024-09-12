import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ConversationApp = () => {
  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.navbarText}>Stage 01</Text>
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>What makes you happy?</Text>
      </View>
      
      <View style={styles.speakersContainer}>
        {/* Add speaker components here */}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Nick and Anna are married. Nick is from London, and Anna grew up near San Francisco. They are talking about happiness.
        </Text>
      </View>
      
      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>Start Listening</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  navbar: {
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  navbarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionContainer: {
    backgroundColor: '#3498db',
    padding: 20,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  speakersContainer: {
    // Add styles for speakers section
  },
  infoContainer: {
    padding: 10,
  },
  infoText: {
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#3498db',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default ConversationApp;
