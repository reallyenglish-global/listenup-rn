import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

export default function PopupNotification({ message, type, onClose }: { message: string; type: string; onClose: () => void }) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text accessibilityRole="header" style={styles.title}>{type === 'success' ? 'Well done!' : 'Try again'}</Text>
          <Text>{message}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="OK" style={styles.button} onPress={onClose}>
            <Text>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: 'white', padding: 24, borderRadius: 8, gap: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  button: { padding: 16, backgroundColor: '#b9dcf4', alignItems: 'center', borderRadius: 8 },
});
