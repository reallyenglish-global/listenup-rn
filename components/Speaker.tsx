import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface SpeakerProps {
  imageUrl: string;
  name: string;
}

const Speaker: React.FC<SpeakerProps> = ({ imageUrl, name }) => {
  return (
    <View style={styles.speakerContainer}>
      <Image source={{ uri: imageUrl }} style={styles.speakerImage} />
      <Text style={styles.speakerName}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  speakerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  speakerImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  speakerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Speaker;
