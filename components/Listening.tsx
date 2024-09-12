import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Slider } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ListeningStage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.stageText}>Stage 01</Text>
      </View>

      <Text style={styles.questionText}>What makes you happy?</Text>

      <View style={styles.speakersContainer}>
        <View style={styles.speakerItem}>
          <Image source={require('./assets/nick.jpg')} style={styles.speakerImage} />
          <Text style={styles.speakerName}>Nick</Text>
        </View>
        <View style={styles.speakerItem}>
          <Image source={require('./assets/anna.jpg')} style={styles.speakerImage} />
          <Text style={styles.speakerName}>Anna</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <Text>0:05</Text>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={1}
          value={progress}
          onValueChange={setProgress}
        />
        <Text>0:21</Text>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.progressIndicator}>
          {/* Add colored bars for progress indicator */}
        </View>
        <TouchableOpacity style={styles.playButton} onPress={() => setIsPlaying(!isPlaying)}>
          <Icon name={isPlaying ? "pause" : "play"} size={30} color="#fff" />
        </TouchableOpacity>
        <View style={styles.playsCounter}>
          <Text style={styles.playsText}>Plays 1</Text>
        </View>
        <TouchableOpacity style={styles.replayButton}>
          <Icon name="rotate-right" size={20} color="#fff" />
          <Text style={styles.replayText}>3s</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.challengeButton}>
        <Text style={styles.challengeButtonText}>Challenge!</Text>
        <Icon name="chevron-right" size={20} color="#3498db" />
      </TouchableOpacity>

      <View style={styles.volumeContainer}>
        <Icon name="volume-up" size={20} color="#000" />
        <Slider style={styles.volumeSlider} minimumValue={0} maximumValue={1} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
  },
  stageText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  speakersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  speakerItem: {
    alignItems: 'center',
  },
  speakerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  speakerName: {
    marginTop: 5,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 10,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressIndicator: {
    height: 10,
    width: '100%',
    backgroundColor: '#ddd',
    marginBottom: 10,
  },
  playButton: {
    backgroundColor: '#3498db',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playsCounter: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#3498db',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  playsText: {
    color: '#fff',
  },
  replayButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replayText: {
    color: '#fff',
    marginLeft: 5,
  },
  challengeButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderColor: '#3498db',
    borderWidth: 2,
    borderRadius: 25,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  challengeButtonText: {
    color: '#3498db',
    fontSize: 18,
    marginRight: 10,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeSlider: {
    flex: 1,
    marginLeft: 10,
  },
});

export default ListeningStage;
