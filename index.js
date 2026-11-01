import TrackPlayer from 'react-native-track-player';

TrackPlayer.registerPlaybackService(() => require('./services/playbackService').default);
require('expo-router/entry');
