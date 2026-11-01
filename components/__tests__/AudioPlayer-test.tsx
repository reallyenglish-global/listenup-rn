import React from 'react';
import renderer from 'react-test-renderer';
import { Image, Platform } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { useAudioPlayer } from '../AudioPlayer';

jest.mock('@react-navigation/native', () => ({ useFocusEffect: jest.fn() }));
jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    getPlaybackState: jest.fn(async () => ({ state: 'none' })),
    setupPlayer: jest.fn(async () => {}),
    updateOptions: jest.fn(async () => {}),
    reset: jest.fn(async () => {}),
    add: jest.fn(async () => {}),
    setRate: jest.fn(async () => {}),
  },
  State: { Playing: 'playing' },
  Capability: {}, AppKilledPlaybackBehavior: {}, Event: {},
  useProgress: () => ({ position: 0, duration: 0 }),
  usePlaybackState: () => ({ state: 'none' }),
  useTrackPlayerEvents: jest.fn(),
}));

const Probe = () => { useAudioPlayer(1); return null; };

afterEach(() => jest.restoreAllMocks());

test.each([
  ['android', 'assets_audios_s1_s1', 'android.resource:///raw/assets_audios_s1_s1'],
  ['android', 'http://localhost:8081/assets/S1.mp3', 'http://localhost:8081/assets/S1.mp3'],
  ['android', 'file:///data/cache/S1.mp3', 'file:///data/cache/S1.mp3'],
  ['ios', 'file:///app/assets/S1.mp3', 'file:///app/assets/S1.mp3'],
] as const)('loads %s audio source %s with a playable URI', async (os, uri, expected) => {
  jest.replaceProperty(Platform, 'OS', os);
  jest.spyOn(Image, 'resolveAssetSource').mockReturnValue({ uri, width: 0, height: 0, scale: 1 });
  (TrackPlayer.add as jest.Mock).mockClear();
  let tree!: renderer.ReactTestRenderer;
  try {
    await renderer.act(async () => { tree = renderer.create(<Probe />); });
    expect(TrackPlayer.add).toHaveBeenCalledWith(expect.objectContaining({ url: expected }));
  } finally {
    if (tree) await renderer.act(async () => tree.unmount());
  }
});
