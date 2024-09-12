import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface SpeakerProps {
  imageUrl: string;
  name: string;
}

const SPEAKER_IMAGE_HEIGHT = 150; // Should match the value in Introduction.tsx

const Speaker: React.FC<SpeakerProps> = ({ imageUrl, name }) => {
  return (
    <View style={styles.speakerContainer}>
      <Image source={{ uri: imageUrl }} style={styles.speakerImage} />
      <View style={styles.nameContainer}>
        <Text style={styles.speakerName}>{name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  speakerContainer: {
    width: SPEAKER_IMAGE_HEIGHT,
    height: SPEAKER_IMAGE_HEIGHT,
    position: 'relative',
  },
  speakerImage: {
    width: '100%',
    height: '100%',
  },
  nameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
  },
  speakerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default Speaker;
