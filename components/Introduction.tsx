import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Speakers from './Speakers';
import FailedTimes from './FailedTimes';
import { ListeningSession } from '@/services/ListeningSession';
import HeaderBar from './HeaderBar';
import StageTitle from './StageTitle';
const Introduction = ({ navigation }) => {
  const { width, height } = useWindowDimensions();

  const [session, setSession] = useState(new ListeningSession());
  const stages = session.getAllStages();

  const SPEAKER_IMAGE_HEIGHT = 150; // Adjust this value to match your speaker image height

  return (
    <View style={[styles.container, { width, height }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {stages.slice(-3, -2).map((stage, index) => (
          <View key={index} style={styles.stage}>
            <HeaderBar stageNumber={stage.number} />
            
            <StageTitle title={stage.title} />
            
            <View style={styles.speakersContainer}>
              <Speakers
                speakers={stage.speakers}
              />
              <FailedTimes failedTimes={stage.failedTimes} height={SPEAKER_IMAGE_HEIGHT} />
            </View>
            
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Time {stage.time}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Difficulty</Text>
                <View style={styles.difficultyStars}>
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="star" size={16} color={i < stage.difficulty ? "#FFD700" : "#D3D3D3"} />
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.contextContainer}>
              <Text style={styles.context}>{stage.context}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('Listening', { stageNumber: stages[0].number })}
      >
        <Text style={styles.startButtonText}>Start Listening</Text>
        <Icon name="chevron-right" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 0,
  },
  stage: {
    flex: 1,
  },
  speakersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  speakersLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  speakerItem: {
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    padding: 10,
  },
  infoLabel: {
    marginRight: 10,
  },
  difficultyStars: {
    flexDirection: 'row',
  },
  contextContainer: {
    flex: 1,
    justifyContent: 'top',
  },
  context: {
    padding: 10,
    textAlign: 'left',
    fontSize: 18,
    lineHeight: 24,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    marginRight: 10,
  },
});

export default Introduction;
