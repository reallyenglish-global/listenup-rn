import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ListeningSession } from '@/services/ListeningSession';
import { Challenge } from '@/services/Challenge';
import HeaderBar from './HeaderBar';
import Notification from './Notification';
import PopupNotification from './PopupNotification';

const Test = ({ route, navigation }) => {
  const stage = new ListeningSession().getCurrentStage();
  const challenge = new Challenge(stage);
  const questions = challenge.questions;
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const handleOptionPress = (option: string) => {
    console.log(option);
    challenge.answer(currentQuestionIndex, option);
    if (currentQuestionIndex === questions.length - 1) {
      const passed = challenge.passed();
      if (passed) {
        showNotification(challenge.response(), 'success');
        navigation.navigate('TranscriptReview');
      } else {
        showNotification(challenge.response(), 'warning');
      }
    } else {
      setCurrentQuestionIndex((currentQuestionIndex + 1) % questions.length);
    }
    //navigation.navigate('TranscriptReview');
  };

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    if (notification.type === 'success') {
      navigation.navigate('TranscriptReview');
    } else if (notification.type === 'warning') {
      navigation.navigate('Introduction');
    }

    setNotification(null);
  };

  return (
    <ScrollView style={styles.container}>
      <HeaderBar title={"Stage " + stage.number + " - Challenge"} />
      <Text style={styles.questionNumber}>Q{currentQuestionIndex + 1}</Text>
      <Text style={styles.questionText}>{questions[currentQuestionIndex].body}</Text>
      {notification && (
        <PopupNotification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
      {questions[currentQuestionIndex].options.map((option, index) => (
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
