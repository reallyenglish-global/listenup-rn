import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, { State, useProgress, usePlaybackState, useTrackPlayerEvents, Event } from 'react-native-track-player';
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
  const [playTimes, setPlayTimes] = useState(0);
  const progress = useProgress();
  const playbackState = usePlaybackState();

  useEffect(() => {
    if (!audioUrl) {
      return;
    }
    setupPlayer();
  }, []);

  useEffect(() => {
    if (!audioUrl) {
      return;
    }
    const adjustPlaybackRate = async () => {
      if (isReady) {
        await TrackPlayer.setRate(playSpeed);
      }
    };
    adjustPlaybackRate();
  }, [playSpeed, isReady]);

  const isPlayerSetup = async () => {
    try {
      const state = await TrackPlayer.getState();
      return state !== 'none';
    } catch (error) {
      console.error('Error checking player state:', error);
      return false;
    }
  }

  const setupPlayer = async () => {
    try {
      const isSetup = await isPlayerSetup();
      if (!isSetup) {
        await TrackPlayer.setupPlayer();
      }
      // clear the queue list
      await TrackPlayer.reset();
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

  const stopAudio = async () => {
    // when playwhenready is true stop won't stop properly
    await TrackPlayer.pause();
  };

  const togglePlayPause = useCallback(async () => {
    console.log('togglePlayPause', playbackState.state);
    if (playbackState.state === State.Playing) {
      await TrackPlayer.pause();
    } else if (playbackState.state === State.Ready || 
      playbackState.state === State.Paused || 
      playbackState.state === State.Ended) {
      await TrackPlayer.play();
    }
  }, [playbackState.state]);

  const seekAudio = async (value: number) => {
    await TrackPlayer.seekTo(value * progress.duration);
  };

  const setSpeed = (speed: number) => {
    setPlaySpeed(speed);
  };

  const handlePlaybackCompletion = useCallback(() => {
    setPlayTimes((prevTimes) => prevTimes + 1);
  }, []);

  useTrackPlayerEvents([Event.PlaybackState], async (event) => {
    if (event.type === Event.PlaybackState && event.state === State.Ended) {
      handlePlaybackCompletion();
    }
  });

  return {
    isReady,
    progress,
    playbackState,
    playSpeed,
    playTimes,
    stopAudio,
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
