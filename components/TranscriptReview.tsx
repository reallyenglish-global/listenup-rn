import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { ListeningSession } from '../services/ListeningSession';
import HeaderBar from './HeaderBar';
import { AudioPlayer } from './AudioPlayer';
const TranscriptReview = ({ navigation, route }) => {
  const stage = new ListeningSession().getCurrentStage();

  return (
    <View style={styles.container}>
      <HeaderBar stageNumber={stage.stageNumber} />
      <View style={styles.container}>
        <AudioPlayer
          audioUrl={stage.audioUrl}
          containerStyle={styles.audioPlayerContainer}
          sliderStyle={styles.audioPlayerSlider}
          textStyle={styles.audioPlayerText}
        />
      </View>
      <ScrollView style={styles.transcriptContainer}>
        <Text style={styles.transcriptText}>{stage.transcript}</Text>
      </ScrollView>

      <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
        <Text>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Your container styles
  },
  title: {
    // Title styles
  },
  audioPlayerContainer: {
    // Custom styles for TranscriptReview view
  },
  audioPlayerSlider: {
    // Custom slider styles for TranscriptReview view
  },
  audioPlayerText: {
    // Custom text styles for TranscriptReview view
  },
  transcriptContainer: {
    flex: 1,
    padding: 20,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    // respect line breaks in the transcript
    // repsect \r\n as well as \n
    whiteSpace: 'pre-wrap',
  },
  doneButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
});

export default TranscriptReview;