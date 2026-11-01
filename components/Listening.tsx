import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { ListeningSession } from '@/services/ListeningSession';
import Speakers from './Speakers';
import HeaderBar from './HeaderBar';
import StageTitle from './StageTitle';
import { AudioPlayer, useAudioPlayer } from './AudioPlayer';
import { useSession } from '@/hooks/useSession';
import BottomBar from './BottomBar';

const Listening = () => {
  const { session } = useSession();
  const currentStage = session!.getCurrentStage();
  const player = useAudioPlayer(currentStage.audioUrl);
  const { stopAudio, togglePlayPause, playbackState, playTimes, playSpeed, setSpeed } = player;

  const handleSpeedChange = async (speed: number) => {
    await setSpeed(speed);
  };

  useEffect(() => {
    const initializeSession = async () => {
      await session.loadProgress();
    };
    return () => {
      console.log('Unmounted', '========');
      stopAudio();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <HeaderBar title={"Stage " + session.getCurrentStageNumber()} />

      <StageTitle title={currentStage.title} />

      <Speakers
        speakers={currentStage.speakers}
      />

      <AudioPlayer
        player={player}
        showControls={false}
      />

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.playButton} accessibilityRole="button" accessibilityLabel={playbackState.state === 'playing' ? "Pause audio" : "Play audio"} disabled={!player.isReady} onPress={togglePlayPause}>
          <Icon name={playbackState.state == 'playing' ? "pause" : "play"} size={50} color="#fff" />
        </TouchableOpacity>
        <View style={styles.playsCounter}>
          <Text style={styles.playsText}>Plays {playTimes}</Text>
        </View>
      </View>

      <View style={styles.speedControlContainer}>
        <Text style={styles.speedText}>Speed: {playSpeed.toFixed(1)}x</Text>
        <Slider
          style={styles.speedSlider}
          minimumValue={0.5}
          maximumValue={2.0}
          step={0.1}
          value={playSpeed}
          onSlidingComplete={handleSpeedChange}
          accessibilityLabel="Playback speed"
          minimumTrackTintColor="#3498db"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#3498db"
        />
      </View>
      </ScrollView>
      <BottomBar title="Challenge" target="Test" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'lightgray',
    padding: 10,
  },
  backButton: {
    padding: 10,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
  },
  stageTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  stageText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50, // Adjust this value to match the width of the back button
  },
  questionText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 10,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressIndicator: {
    height: 10,
    width: '100%',
    backgroundColor: '#ddd',
    marginBottom: 10,
  },
  playButton: {
    marginTop: 24,
    marginBottom: 30,
    backgroundColor: '#3498db',
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playsCounter: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#3498db',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  playsText: {
    color: '#fff',
  },
  replayButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replayText: {
    color: '#fff',
    marginLeft: 5,
  },
  challengeButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderColor: '#3498db',
    borderWidth: 2,
    borderRadius: 25,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  challengeButtonText: {
    color: '#3498db',
    fontSize: 18,
    marginRight: 10,
  },
  timeText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  speedControlContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  speedText: {
    fontSize: 16,
    marginBottom: 10,
  },
  speedSlider: {
    width: '80%',
  },
});

export default Listening;
