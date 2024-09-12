import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Test = ({ route, navigation }) => {
  const { stageNumber } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Stage {stageNumber}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Introduction')}
      >
        <Text style={styles.buttonText}>Back to Introduction</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default Test;
