import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, { State, useProgress, usePlaybackState } from 'react-native-track-player';
import PlayButton from './PlayButton';

interface AudioPlayerProps {
  audioUrl: string;
  showControls?: boolean;
  onProgressChange?: (progress: number) => void;
  containerStyle?: object;
  sliderStyle?: object;
  textStyle?: object;
}

// Custom hook to manage audio player state and functions
const useAudioPlayer = (audioUrl: string) => {
  const [isReady, setIsReady] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const progress = useProgress();
  const playbackState = usePlaybackState();

  useEffect(() => {
    setupPlayer();
  }, []);

  useEffect(() => {
    const adjustPlaybackRate = async () => {
      if (isReady) {
        await TrackPlayer.setRate(playSpeed);
      }
    };
    adjustPlaybackRate();
  }, [playSpeed, isReady]);

  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.add({
        url: audioUrl,
        title: 'Audio Track',
        artist: 'Unknown',
      });
      setIsReady(true);
    } catch (error) {
      console.error('Error setting up player:', error);
    }
  };

  const togglePlayPause = useCallback(async () => {
    if (playbackState.state === State.Playing) {
      console.log('Pausing audio');
      await TrackPlayer.pause();
    } else {
      console.log('Playing audio');
      await TrackPlayer.play();
    }
  }, [playbackState.state]);

  const seekAudio = async (value: number) => {
    await TrackPlayer.seekTo(value * progress.duration);
  };

  const setSpeed = (speed: number) => {
    setPlaySpeed(speed);
  };

  return {
    isReady,
    progress,
    playbackState,
    playSpeed,
    togglePlayPause,
    seekAudio,
    setSpeed
  };
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  showControls = true,
  onProgressChange,
  containerStyle,
  sliderStyle,
  textStyle
}) => {
  const {
    isReady,
    progress,
    playbackState,
    togglePlayPause,
    seekAudio
  } = useAudioPlayer(audioUrl);

  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(progress.position / progress.duration);
    }
  }, [progress, onProgressChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!isReady) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      {showControls && (
        <View style={styles.controlsContainer}>
          <PlayButton onPress={togglePlayPause} isPlaying={playbackState.state === State.Playing} />
        </View>
      )}
      <Text style={[styles.timeText, textStyle]}>
        {formatTime(progress.position)}
      </Text>
      <Slider
        style={[styles.slider, sliderStyle]}
        minimumValue={0}
        maximumValue={1}
        value={progress.position / progress.duration}
        onSlidingComplete={seekAudio}
      />
      <Text style={[styles.timeText, textStyle]}>
        {formatTime(progress.duration)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
});

export { AudioPlayer, useAudioPlayer };