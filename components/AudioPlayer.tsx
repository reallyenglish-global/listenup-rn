import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import TrackPlayer, { State, Capability, AppKilledPlaybackBehavior, useProgress, usePlaybackState, useTrackPlayerEvents, Event } from 'react-native-track-player';
import PlayButton from './PlayButton';

let setup: Promise<void> | undefined;
let loading = Promise.resolve();

const useAudioPlayer = (audioUrl: number) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [playTimes, setPlayTimes] = useState(0);
  const progress = useProgress(250);
  const playbackState = usePlaybackState();

  useEffect(() => {
    let active = true;
    setIsReady(false);
    setError(false);
    loading = loading.catch(() => {}).then(async () => {
      if (!active) return;
      if (!setup) {
        setup = (async () => {
          await TrackPlayer.getPlaybackState().catch(() => TrackPlayer.setupPlayer());
          await TrackPlayer.updateOptions({
            capabilities: [Capability.Play, Capability.Pause, Capability.Stop, Capability.SeekTo],
            android: { appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification },
          });
        })().catch(reason => { setup = undefined; throw reason; });
      }
      await setup;
      if (!active) return;
      await TrackPlayer.reset();
      const source = Image.resolveAssetSource(audioUrl).uri;
      // Metro release audio lives in res/raw. A bare resource name is not a
      // filesystem path; ExoPlayer resolves this URI in the current package.
      const url = Platform.OS === 'android' && /^[a-z0-9_]+$/.test(source)
        ? `android.resource:///raw/${source}`
        : source;
      await TrackPlayer.add({ url, title: 'ListenUp', artist: 'ReallyEnglish' });
      await TrackPlayer.setRate(1);
      if (active) setIsReady(true);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [audioUrl]);

  const stopAudio = useCallback(async () => {
    if (setup) await TrackPlayer.pause().catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => () => { void stopAudio(); }, [stopAudio]));

  const togglePlayPause = async () => {
    if (!isReady) return;
    try {
      if (playbackState.state === State.Playing) await TrackPlayer.pause();
      else {
        if (playbackState.state === State.Ended) await TrackPlayer.seekTo(0);
        await TrackPlayer.play();
      }
    } catch { setError(true); }
  };

  const setSpeed = async (speed: number) => {
    if (!isReady) return;
    try { await TrackPlayer.setRate(speed); setPlaySpeed(speed); }
    catch { setError(true); }
  };

  const seekAudio = async (value: number) => {
    if (isReady && progress.duration > 0) {
      try { await TrackPlayer.seekTo(value * progress.duration); }
      catch { setError(true); }
    }
  };

  useTrackPlayerEvents([Event.PlaybackQueueEnded, Event.PlaybackError], event => {
    if (event.type === Event.PlaybackQueueEnded) setPlayTimes(value => value + 1);
    if (event.type === Event.PlaybackError) setError(true);
  });

  return { isReady, error, progress, playbackState, playSpeed, playTimes, stopAudio, togglePlayPause, seekAudio, setSpeed };
};

type Player = ReturnType<typeof useAudioPlayer>;
const AudioPlayer = ({ player, showControls = true, positionID = 'audio-position' }: { player: Player; showControls?: boolean; positionID?: string }) => {
  const { isReady, error, progress, playbackState, togglePlayPause, seekAudio } = player;
  const formatTime = (seconds: number) => {
    const value = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  };
  if (error) return <Text accessibilityRole="alert">Audio unavailable. Return home and try again.</Text>;
  if (!isReady) return <Text>Loading audio…</Text>;
  return (
    <View>
      {showControls && <PlayButton onPress={togglePlayPause} isPlaying={playbackState.state === State.Playing} />}
      <View style={styles.timeline}>
        <Text testID={positionID}>{formatTime(progress.position)}</Text>
        <Slider
          accessibilityLabel="Audio position"
          style={styles.slider}
          minimumValue={0} maximumValue={1}
          value={progress.duration > 0 ? progress.position / progress.duration : 0}
          onSlidingComplete={seekAudio}
        />
        <Text>{formatTime(progress.duration)}</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  timeline: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  slider: { flex: 1, marginHorizontal: 10 },
});
export { AudioPlayer, useAudioPlayer };
