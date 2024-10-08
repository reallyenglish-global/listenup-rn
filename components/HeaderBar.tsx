import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// why do I need this?
type RootStackParamList = {
  Introduction: undefined;
  Listening: undefined;
  // ... other screens
};

type HeaderBarNavigationProp = StackNavigationProp<RootStackParamList, 'Listening'>;

interface HeaderBarProps {
  title: String;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ title }) => {
  const navigation = useNavigation<HeaderBarNavigationProp>();

  const handleHomePress = () => {
    navigation.navigate('Introduction');
  };

  return (
    <View style={styles.header}>
      {navigation.canGoBack() && (
        <TouchableOpacity style={styles.backButton} onPress={handleHomePress}>
          <Text style={styles.backButtonText}>← Home</Text>
        </TouchableOpacity>
      )}
      <View style={styles.stageTextContainer}>
        <Text style={styles.stageText}>{title}</Text>
      </View>
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'lightgray',
    padding: 10,
    height: 50,
  },
  backButton: {
    padding: 10,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
  },
  stageTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  stageText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50, // Adjust this value to match the width of the back button
  },
});

export default HeaderBar;
