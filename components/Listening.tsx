import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ListeningSession } from '@/services/ListeningSession';
import { Audio } from 'expo-av';

const Listening = () => {
  const [session, setSession] = useState(new ListeningSession());
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const currentStage = session.getCurrentStage();

  const handleProgressChange = (progress: number) => {
    const newSession = new ListeningSession();
    session.setProgress(progress);
  };

  const handlePlayPress = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } else {
      console.log('=======', currentStage.audio);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentStage.audio },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = async (speed: number) => {
    setPlaybackSpeed(speed);
    if (sound) {
      await sound.setRateAsync(speed, true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backButton}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.stageText}>Stage {session.getCurrentStageNumber()}</Text>
      </View>

      <Text style={styles.questionText}>{currentStage.question}</Text>

      <View style={styles.speakersContainer}>
        {currentStage.speakers.map((speaker, index) => (
          <View key={index} style={styles.speakerItem}>
            <Image source={{ uri: speaker.image }} style={styles.speakerImage} />
            <Text style={styles.speakerName}>{speaker.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.progressBarContainer}>
        <Text style={styles.timeText}>
          {session.getProgressTime()}
        </Text>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={1}
          value={session.getProgress()}
          onValueChange={handleProgressChange}
          minimumTrackTintColor="#3498db"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#3498db"
        />
        <Text style={styles.timeText}>{currentStage.duration}</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPress}>
          <Icon name={isPlaying ? "pause" : "play"} size={50} color="#fff" />
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

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.challengeButton}>
          <Text style={styles.challengeButtonText}>Challenge!</Text>
          <Icon name="chevron-right" size={20} color="#3498db" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
  },
  stageText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  speakersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  speakerItem: {
    alignItems: 'center',
  },
  speakerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  speakerName: {
    marginTop: 5,
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
  bottomContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
