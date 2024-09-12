import React from 'react';
import { View, StyleSheet } from 'react-native';
import Speaker from './Speaker';

interface SpeakerData {
  imageUrl: string;
  name: string;
}

interface SpeakersProps {
  speakers: SpeakerData[];
}

const Speakers: React.FC<SpeakersProps> = ({ speakers }) => {
  return (
    <View style={styles.container}>
      {speakers.map((speaker, index) => (
        <Speaker
          key={index}
          imageUrl={speaker.imageUrl}
          name={speaker.name}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});

export default Speakers;
