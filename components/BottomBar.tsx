import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';

type RootStackParamList = {
  Introduction: undefined;
  Listening: undefined;
  // ... other screens
};

type BottomBarNavigationProp = StackNavigationProp<RootStackParamList, 'Introduction'>;

interface BottomBarProps {
  title: string;
  target: string;
  showNext?: boolean;
}

const BottomBar: React.FC<BottomBarProps> = ({ title, target, showNext=true }) => {
  const navigation = useNavigation<BottomBarNavigationProp>();

  const handleClick = () => {
    navigation.navigate(target);
  };

  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.startButton} onPress={handleClick}>
        <Text style={styles.startButtonText}>{ title }</Text>
        { showNext && (<Icon name="chevron-right" size={18} color="#fff" />)}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    justifyContent: 'center',
  },
  startButton: {
    width: '90%',
    flexDirection: 'row',
    backgroundColor: '#3498db',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    marginRight: 10,
  },
});

export default BottomBar;
