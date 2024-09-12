import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ListeningSession } from '@/services/ListeningSession';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Assuming you have a RootStackParamList defined somewhere in your app
type RootStackParamList = {
  Introduction: undefined;
  Listening: undefined;
  // ... other screens
};

type ListeningScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Listening'>;

const Listening = () => {
  const navigation = useNavigation<ListeningScreenNavigationProp>();
  const [session, setSession] = useState(new ListeningSession());
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const progressUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }
    };
  }, [sound]);

  const currentStage = session.getCurrentStage();

  const updateProgress = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setProgress(status.positionMillis / status.durationMillis);
        setCurrentTime(status.positionMillis);
        setDuration(status.durationMillis);
      }
    }
  };

  const handleProgressChange = async (value: number) => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = value * status.durationMillis;
        await sound.setPositionAsync(newPosition);
        setProgress(value);
        setCurrentTime(newPosition);
      }
    }
  };

  const handlePlayPress = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        if (progressUpdateIntervalRef.current) {
          clearInterval(progressUpdateIntervalRef.current);
        }
      } else {
        await sound.playAsync();
        progressUpdateIntervalRef.current = setInterval(updateProgress, 100); // Update more frequently
      }
      setIsPlaying(!isPlaying);
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentStage.audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      progressUpdateIntervalRef.current = setInterval(updateProgress, 100); // Update more frequently
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
            if (progressUpdateIntervalRef.current) {
              clearInterval(progressUpdateIntervalRef.current);
            }
            // Increment play count when audio finishes
            session.incrementPlays();
          } else {
            setProgress(status.positionMillis / status.durationMillis);
            setCurrentTime(status.positionMillis);
            setDuration(status.durationMillis);
          }
        }
      });
    }
  };

  const handleSpeedChange = async (speed: number) => {
    setPlaybackSpeed(speed);
    if (sound) {
      await sound.setRateAsync(speed, true);
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`;
  };

  const handleHomePress = () => {
    navigation.navigate('Introduction');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleHomePress}>
          <Text style={styles.backButtonText}>← Home</Text>
        </TouchableOpacity>
        <View style={styles.stageTextContainer}>
          <Text style={styles.stageText}>Stage {session.getCurrentStageNumber()}</Text>
        </View>
        <View style={styles.placeholder} />
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
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={1}
          value={progress}
          onValueChange={handleProgressChange}
          minimumTrackTintColor="#3498db"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#3498db"
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
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
