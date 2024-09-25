import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import HeaderBar from './HeaderBar';
import { useSession } from '@/hooks/useSession';
import { AudioPlayer } from './AudioPlayer';
import BottomBar from './BottomBar';
const TranscriptReview = ({ navigation, route }) => {
  const { width, height } = useWindowDimensions();
  const { session } = useSession();
  if (!session) {
    return <Text>Loading...</Text>;
  }
  const stage = session.getCurrentStage();

  return (
    <View style={[styles.container, { width, height }]}>
      <HeaderBar title={"Stage " + stage.number + ' - Transcript'} />
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

      <BottomBar title="Done" target="Introduction" showNext={false}/>
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
  transcriptContainer: {
    flex: 1,
    padding: 20,
    height: '60%',
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
