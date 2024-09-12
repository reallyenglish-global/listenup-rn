import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

const Stage = ({ number, question, locked, onPress }) => (
  <View style={[styles.stage, { height: height - 60 }]}>
    <Text style={styles.stageNumber}>Stage {number.toString().padStart(2, '0')}</Text>
    <Text style={styles.question}>{question}</Text>
    {locked ? (
      <View style={styles.lockedIcon}>
        {/* Add a lock icon here */}
      </View>
    ) : (
      <TouchableOpacity style={styles.startButton} onPress={onPress}>
        <Text style={styles.startButtonText}>Start Listening</Text>
      </TouchableOpacity>
    )}
  </View>
);

const App = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const scrollViewRef = useRef(null);

  const stages = [
    { question: "What makes you happy?", locked: false },
    { question: "What do you do?", locked: true },
    // Add more stages as needed
  ];

  const handleScroll = (event) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const newStage = Math.round(contentOffsetY / height);
    setCurrentStage(newStage);
  };

  const scrollToStage = (index) => {
    scrollViewRef.current.scrollTo({ y: index * height, animated: true });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        pagingEnabled
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {stages.map((stage, index) => (
          <Stage
            key={index}
            number={index + 1}
            question={stage.question}
            locked={stage.locked}
            onPress={() => console.log(`Start listening to stage ${index + 1}`)}
          />
        ))}
      </ScrollView>
      <View style={styles.navigation}>
        {stages.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.navDot, currentStage === index && styles.navDotActive]}
            onPress={() => scrollToStage(index)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stage: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stageNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  question: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  lockedIcon: {
    // Style for the lock icon
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  navDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  navDotActive: {
    backgroundColor: '#3498db',
  },
});

export default App;
