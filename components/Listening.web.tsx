import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSession } from '@/hooks/useSession';
import HeaderBar from './HeaderBar';
import StageTitle from './StageTitle';
import Speakers from './Speakers';
import BottomBar from './BottomBar';
import { AudioPlayer } from './AudioPlayer';

export default function Listening() {
  const { session } = useSession();
  if (!session) return <Text>Loading...</Text>;
  const stage = session.getCurrentStage();
  return <View style={styles.container}>
    <ScrollView>
      <HeaderBar title={`Stage ${stage.number}`} />
      <StageTitle title={stage.title} />
      <Speakers speakers={stage.speakers} />
      <AudioPlayer audioUrl={stage.audioUrl} />
    </ScrollView>
    <BottomBar title="Challenge" target="Test" />
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f0f0f0' } });
