import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FailedTimesProps {
  failedTimes: number;
}

const FailedTimes: React.FC<FailedTimesProps> = ({ failedTimes }) => {
  return (
    <View style={styles.failedContainer}>
      <Text style={styles.failedLabel}>Failed</Text>
      <View style={styles.failedTimesPlate}>
        <Text style={styles.failedTimes}>{failedTimes.toString().padStart(2, '0')}</Text>
      </View>
      <Text style={styles.failedLabel}>Times</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  failedContainer: {
    alignItems: 'center',
  },
  failedLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  failedTimesPlate: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 15,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  failedTimes: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'monospace',
  },
});

export default FailedTimes;
