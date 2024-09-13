import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ListeningSession } from '@/services/ListeningSession';
import HeaderBar from './HeaderBar';
const Test = ({ route, navigation }) => {
  const stage = new ListeningSession().getCurrentStage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const currentQuestion = stage.questions[currentQuestionIndex];
  const handleOptionPress = (option: string) => {
    console.log(option);
    if (currentQuestionIndex < stage.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      navigation.navigate('TranscriptReview');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <HeaderBar title={"Stage " + stage.number + " - Challenge"} />
      <Text style={styles.questionNumber}>Q{currentQuestionIndex + 1}</Text>
      <Text style={styles.questionText}>{currentQuestion.body}</Text>
      {currentQuestion.options.sort(() => Math.random() - 0.5).map((option, index) => (
        <TouchableOpacity key={index} style={styles.optionButton}
          onPress={() => handleOptionPress(option)}
        >
          <Text style={styles.optionText}>{option.split('|').sort(() => Math.random() - 0.5)[0]}</Text>
          <Text style={styles.arrowIcon}>{'>'}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: '#f5f5f5',
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 80,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 26,
    padding: 20,
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
