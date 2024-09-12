import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StageTitleProps {
  title: string;
}

const StageTitle: React.FC<StageTitleProps> = ({ title }) => {
  return (
    <View style={styles.questionContainer}>
       <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
});
export default StageTitle;
