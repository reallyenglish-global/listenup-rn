import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSession } from '@/hooks/useSession';
import HeaderBar from './HeaderBar';
import { AudioPlayer } from './AudioPlayer';

export default function TranscriptReview({ navigation }: { navigation: { replace: (screen: 'Introduction') => void } }) {
  const { session } = useSession();
  const [saving, setSaving] = useState(false);
  if (!session) return <Text>Loading...</Text>;
  const stage = session.getCurrentStage();
  const done = async () => {
    if (saving) return;
    setSaving(true);
    await session.moveToNextStage();
    navigation.replace('Introduction');
  };
  return <View style={{ flex: 1 }}>
    <HeaderBar title={`Stage ${stage.number} - Transcript`} />
    <AudioPlayer audioUrl={stage.audioUrl} />
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text>{stage.transcript}</Text>
    </ScrollView>
    <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={done} style={{ padding: 20 }}>
      <Text>{saving ? 'Saving...' : 'Done'}</Text>
    </TouchableOpacity>
  </View>;
}
