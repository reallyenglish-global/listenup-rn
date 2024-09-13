import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ListeningSession } from '@/services/ListeningSession';
import { Audio } from 'expo-av';
import Speakers from './Speakers';
import HeaderBar from './HeaderBar';
import StageTitle from './StageTitle';
import { AudioPlayer, useAudioPlayer } from './AudioPlayer';
import BottomBar from './BottomBar';

const Listening = () => {
  const [session, setSession] = useState(new ListeningSession());
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const { togglePlayPause, playbackState } = useAudioPlayer()

  const currentStage = session.getCurrentStage();

  const handleSpeedChange = async (speed: number) => {
    setPlaybackSpeed(speed);
    if (sound) {
      await sound.setRateAsync(speed, true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title={"Stage " + session.getCurrentStageNumber()} />

      <StageTitle title={currentStage.title} />

      <Speakers
        speakers={currentStage.speakers}
      />

      <AudioPlayer
        audioUrl={currentStage.audioUrl}
        showControls={false}
        containerStyle={styles.audioPlayerContainer}
        sliderStyle={styles.audioPlayerSlider}
        textStyle={styles.audioPlayerText}
      />

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
          <Icon name={playbackState.state == 'playing' ? "pause" : "play"} size={50} color="#fff" />
        </TouchableOpacity>
        <View style={styles.playsCounter}>
          <Text style={styles.playsText}>Plays {session.getPlays()}</Text>
        </View>
      </View>

      <View style={styles.speedControlContainer}>
        <Text style={styles.speedText}>Speed: {playbackSpeed.toFixed(1)}x</Text>
        <Slider
          style={styles.speedSlider}
          minimumValue={0.5}
          maximumValue={2.0}
          step={0.1}
          value={playbackSpeed}
          onValueChange={handleSpeedChange}
          minimumTrackTintColor="#3498db"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#3498db"
        />
      </View>
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
    marginTop: 100,
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
