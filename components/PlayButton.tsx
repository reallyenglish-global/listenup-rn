import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface PlayButtonProps {
  isPlaying: boolean;
  onPress: () => void;
  size?: number;
  color?: string;
  style?: object;
}

const PlayButton: React.FC<PlayButtonProps> = ({
  isPlaying,
  onPress,
  size = 40,
  color = '#000',
  style
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Icon
          name={isPlaying ? 'pause' : 'play'}
          size={size * 0.4}
          color={color}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 1000,
    backgroundColor: '#3498db',
  },
});

export default PlayButton;
