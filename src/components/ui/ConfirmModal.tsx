import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { theme } from '../../theme';

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title = 'Confirm',
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttonRow}>
          <Button variant="outline" onPress={onCancel} style={styles.button}>{cancelText}</Button>
          <Button variant="destructive" onPress={onConfirm} style={styles.button}>{confirmText}</Button>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    width: 320,
    maxWidth: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.font.sizeHeading,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.font.family,
  },
  message: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    fontFamily: theme.font.family,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  button: {
    minWidth: 100,
  },
}); 