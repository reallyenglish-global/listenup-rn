import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface SpeakerProps {
  imageUrl: string;
  name: string;
}

const Speaker: React.FC<SpeakerProps> = ({ imageUrl, name }) => {
  return (
    <View style={styles.speakerContainer}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.speakerImage} />
        <View style={styles.nameContainer}>
          <Text style={styles.speakerName}>{name}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  speakerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  speakerImage: {
    width: 150,
    height: 150,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default Speaker;
