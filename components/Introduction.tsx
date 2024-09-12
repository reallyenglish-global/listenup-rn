import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Speakers from './Speakers';
import { ListeningSession } from '@/services/ListeningSession';
const Introduction = ({ navigation }) => {
  const { width, height } = useWindowDimensions();

  const [session, setSession] = useState(new ListeningSession());
  const stages = session.getAllStages();

  return (
    <View style={[styles.container, { width, height }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {stages.slice(0, 1).map((stage, index) => (
          <View key={index} style={styles.stage}>
            <View style={styles.header}>
              <Icon name="bars" size={24} color="#000" />
              <Text style={styles.stageNumber}>Stage {stage.number.toString().padStart(2, '0')}</Text>
              <View style={{ width: 24 }} /> {/* Placeholder for symmetry */}
            </View>
            
            <View style={styles.questionContainer}>
              <Text style={styles.title}>{stage.title}</Text>
            </View>
            
            <View style={styles.speakersContainer}>
              <Text style={styles.speakersLabel}>Speakers</Text>
              <Speakers
                speakers={stage.speakers}
              />
              <View style={styles.failedContainer}>
                <Text style={styles.failedLabel}>Failed</Text>
                <Text style={styles.failedTimes}>{stage.failedTimes.toString().padStart(2, '0')}</Text>
                <Text style={styles.failedLabel}>Times</Text>
              </View>
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
    padding: 20,
  },
  stage: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stageNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionContainer: {
    backgroundColor: '#3498db',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  question: {
    color: '#fff',
    fontSize: 28,
    textAlign: 'center',
  },
  speakersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  speakersLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  speakerItem: {
    alignItems: 'center',
  },
  speakerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  speakerName: {
    marginTop: 5,
  },
  failedContainer: {
    alignItems: 'center',
  },
  failedLabel: {
    fontSize: 12,
  },
  failedTimes: {
    fontSize: 24,
    fontWeight: 'bold',
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
    justifyContent: 'center',
    marginBottom: 20,
  },
  context: {
    textAlign: 'center',
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
