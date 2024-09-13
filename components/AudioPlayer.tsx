import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, { State, useProgress, usePlaybackState } from 'react-native-track-player';
import PlayButton from './PlayButton';

interface AudioPlayerProps {
  audioUrl: string;
  onProgressChange?: (progress: number) => void;
  containerStyle?: object;
  sliderStyle?: object;
  textStyle?: object;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  onProgressChange,
  containerStyle,
  sliderStyle,
  textStyle
}) => {
  const progress = useProgress();
  const playbackState = usePlaybackState();

  const [isReady, setIsReady] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);

  useEffect(() => {
    setupPlayer();
  }, []);

  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(progress.position / progress.duration);
    }
  }, [progress]);

  // when play speed changes, set the playback state
  useEffect(() => {
    const adjustPlaybackRate = async () => {
      if (isReady) {
        await TrackPlayer.setRate(playSpeed);
      }
    };

    adjustPlaybackRate();
  }, [playSpeed]);

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

  const togglePlayPause = async () => {
    if (playbackState.state === State.Playing) {
      console.log('Pausing audio');
      await TrackPlayer.pause();
    } else {
      console.log('Playing audio');
      await TrackPlayer.play();
    }
  };

  const seekAudio = async (value: number) => {
    await TrackPlayer.seekTo(value * progress.duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!isReady) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.controlsContainer}>
        <PlayButton onPress={togglePlayPause} isPlaying={playbackState.state === State.Playing} />
      </View>
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

export default AudioPlayer;