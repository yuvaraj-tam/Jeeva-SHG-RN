import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  Platform,
  Dimensions,
} from 'react-native';
import { theme } from '../../theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

interface ModalContentProps {
  children: React.ReactNode;
}

interface ModalFooterProps {
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  style,
}) => {
  return (
    <RNModal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, style]}>
          {children}
        </View>
      </View>
    </RNModal>
  );
};

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

export const ModalContent: React.FC<ModalContentProps & { style?: ViewStyle }> = ({ children, style }) => {
  const windowHeight = Dimensions.get('window').height;
  return (
    <ScrollView
      style={[styles.content, style]}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
};

export const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => {
  return (
    <View style={styles.footer}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    minWidth: 320,
    maxWidth: 400,
    maxHeight: Dimensions.get('window').height * 0.9,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: theme.elevation.lg,
    elevation: theme.elevation.lg,
    overflow: Platform.OS === 'web' ? 'scroll' : 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.font.sizeHeading,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeText: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
}); 