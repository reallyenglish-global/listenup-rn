import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, { useProgress, usePlaybackState } from 'react-native-track-player';

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

  useEffect(() => {
    setupPlayer();
  }, []);

  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(progress.position / progress.duration);
    }
  }, [progress]);

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
    if (playbackState === TrackPlayer.STATE_PLAYING) {
      await TrackPlayer.pause();
    } else {
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
      <TouchableOpacity onPress={togglePlayPause}>
        <Text style={[styles.playPauseText, textStyle]}>
          {playbackState === TrackPlayer.STATE_PLAYING ? 'Pause' : 'Play'}
        </Text>
      </TouchableOpacity>
      <Slider
        style={[styles.slider, sliderStyle]}
        minimumValue={0}
        maximumValue={1}
        value={progress.position / progress.duration}
        onSlidingComplete={seekAudio}
      />
      <Text style={[styles.timeText, textStyle]}>
        {formatTime(progress.position)} / {formatTime(progress.duration)}
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
  playPauseText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 12,
  },
});

export default AudioPlayer;