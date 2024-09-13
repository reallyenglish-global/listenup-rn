import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ListeningSession } from '@/services/ListeningSession';

const Test = ({ route, navigation }) => {
  const stage = new ListeningSession().getCurrentStage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const currentQuestion = stage.questions[currentQuestionIndex];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.stageTitle}>{`Stage ${stage.number} - ${stage.title}`}</Text>
      <Text style={styles.questionNumber}>Q{currentQuestionIndex + 1}</Text>
      <Text style={styles.questionText}>{currentQuestion.text}</Text>
      {currentQuestion.options.map((option, index) => (
        <TouchableOpacity key={index} style={styles.optionButton}>
          <Text style={styles.optionText}>{option}</Text>
          <Text style={styles.arrowIcon}>{'>'}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  optionText: {
    fontSize: 16,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#888',
  },
});

export default Test;
