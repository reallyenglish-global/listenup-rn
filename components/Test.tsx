import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Challenge } from '@/services/Challenge';
import HeaderBar from './HeaderBar';
import PopupNotification from './PopupNotification';
import { useSession } from '@/hooks/useSession';

const Test = ({ navigation }) => {
  const { session } = useSession();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [notification, setNotification] = useState(null);
  const stage = session?.getCurrentStage();

  useEffect(() => {
    const initializeSession = async () => {
      const newChallenge = new Challenge(stage);
      setChallenge(newChallenge);
      setQuestions(newChallenge.getQuestions());
      setCurrentQuestionIndex(0);
    };

    initializeSession();
  }, []);

  const handleOptionPress = async (option: string) => {
    if (!challenge) return;

    challenge.answer(currentQuestionIndex, option);
    if (currentQuestionIndex === questions.length - 1) {
      const passed = challenge.passed();
      if (passed) {
        showNotification(challenge.response(), 'success');
        await session.moveToNextStage();
        const newChallenge = new Challenge(stage);
        setChallenge(newChallenge);
        setQuestions(newChallenge.getQuestions());
        setCurrentQuestionIndex(0);
      } else {
        showNotification(challenge.response(), 'warning');
      }
    } else {
      setCurrentQuestionIndex(prevIndex => {
        const newIndex = (prevIndex + 1) % questions.length;
        challenge.setCurrentQuestionIndex(newIndex);
        return newIndex;
      });
    }
  };

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

  if (!challenge) return null;

  return (
    <ScrollView style={styles.container}>
      <HeaderBar title={`Stage ${stage.number} - Challenge`} />
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
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            questions[currentQuestionIndex].answer === option && styles.selectedOption
          ]}
          onPress={() => handleOptionPress(option)}
        >
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
  selectedOption: {
    backgroundColor: '#e0e0e0',
  },
});

export default Test;
