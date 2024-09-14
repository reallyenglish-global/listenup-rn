import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, { State, useProgress, usePlaybackState, useTrackPlayerEvents, Event } from 'react-native-track-player';
import PlayButton from './PlayButton';

// Create a context for the audio player
const AudioPlayerContext = createContext<ReturnType<typeof useAudioPlayerState> | null>(null);

// Hook to manage audio player state
const useAudioPlayerState = () => {
  const [isReady, setIsReady] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [playTimes, setPlayTimes] = useState(0);
  const progress = useProgress();
  const playbackState = usePlaybackState();

  useEffect(() => {
    const adjustPlaybackRate = async () => {
      if (isReady) {
        await TrackPlayer.setRate(playSpeed);
      }
    };
    adjustPlaybackRate();
  }, [playSpeed, isReady]);

  const stopAudio = async () => {
    await TrackPlayer.stop();
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
    console.log('Seeking audio to ' + value, '========');
    await TrackPlayer.seekTo(value * progress.duration);
  };

  const setSpeed = (speed: number) => {
    console.log('setSpeed', '========', speed);
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
    setIsReady,
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

// Provider component that sets up the player
const AudioPlayerProvider: React.FC<{ audioUrl: string; children: React.ReactNode }> = ({ audioUrl, children }) => {
  const audioPlayerState = useAudioPlayerState();

  useEffect(() => {
    const setupPlayer = async () => {
      if (!audioUrl) {
        console.log('audioUrl not set', '========');
        return;
      }
      try {
        console.log('Setting up player', '========', audioUrl);
        await TrackPlayer.setupPlayer();
        await TrackPlayer.add({
          url: audioUrl,
          title: 'Audio Track',
          artist: 'Unknown',
        });
        audioPlayerState.setIsReady(true);
      } catch (error) {
        console.error('Error setting up player:', error);
      }
    };

    setupPlayer();

    return () => {
      TrackPlayer.destroy();
    };
  }, [audioUrl]);

  return (
    <AudioPlayerContext.Provider value={audioPlayerState}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

// Hook to use the audio player context
const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

interface AudioPlayerProps {
  showControls?: boolean;
  onProgressChange?: (progress: number) => void;
  containerStyle?: object;
  sliderStyle?: object;
  textStyle?: object;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
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
  } = useAudioPlayer();

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

export { AudioPlayerProvider, AudioPlayer, useAudioPlayer };