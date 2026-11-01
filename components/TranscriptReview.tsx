import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSession } from '../hooks/useSession';
import { Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import HeaderBar from './HeaderBar';
import { AudioPlayer, useAudioPlayer } from './AudioPlayer';
import BottomBar from './BottomBar';
const TranscriptReview = ({ navigation }: { navigation: StackNavigationProp<RootStackParamList> }) => {
  const { session } = useSession();
  const [stage] = useState(() => session!.getCurrentStage());
  const player = useAudioPlayer(stage.audioUrl);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const finish = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await session!.moveToNextStage();
      navigation.reset({ index: 0, routes: [{ name: 'Introduction' }] });
    } catch {
      Alert.alert('Progress not saved', 'Please try Done again.');
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar title={"Stage " + stage.number + ' - Transcript'} />
      <View>
        <AudioPlayer
          player={player}
          positionID="review-audio-position"
        />
      </View>
      <ScrollView style={styles.transcriptContainer}>
        <Text style={styles.transcriptText}>{stage.transcript}</Text>
      </ScrollView>

      <BottomBar title={saving ? "Saving…" : "Done"} target="Introduction" showNext={false} onPress={finish} disabled={saving}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    // Title styles
  },
  audioPlayerContainer: {
    // Custom styles for TranscriptReview view
  },
  audioPlayerSlider: {
    // Custom slider styles for TranscriptReview view
  },
  audioPlayerText: {
    // Custom text styles for TranscriptReview view
  },
  transcriptContainer: {
    flex: 1,
    padding: 20,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    // respect line breaks in the transcript
    // repsect \r\n as well as \n

  },
  doneButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
});

export default TranscriptReview;
