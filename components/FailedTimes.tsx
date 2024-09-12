import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FailedTimesProps {
  failedTimes: number;
}

const FailedTimes: React.FC<FailedTimesProps> = ({ failedTimes }) => {
  return (
    <View style={styles.failedTimesPlate}>
      <Text style={styles.failedLabel}>Failed</Text>
      <Text style={styles.failedTimes}>{failedTimes.toString().padStart(2, '0')}</Text>
      <Text style={styles.timesLabel}>Times</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  failedTimesPlate: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 15,
    minWidth: 120,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  failedLabel: {
    fontSize: 14,
    color: '#FFF',
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  failedTimes: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'monospace',
  },
  timesLabel: {
    fontSize: 14,
    color: '#FFF',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});

export default FailedTimes;
