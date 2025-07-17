import React, { useEffect, useState } from 'react';
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
  DimensionValue,
} from 'react-native';
import { theme } from '../../theme';
import { isInIframe } from '../../utils/iframeDetection';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

interface ModalContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
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
  size = 'medium',
}) => {
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [isMobile, setIsMobile] = useState(false);
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      const dims = Dimensions.get('window');
      setScreenDimensions(dims);
      setIsMobile(dims.width < 768);
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    updateDimensions();

    // Check if in iframe
    if (Platform.OS === 'web') {
      setIsIframe(isInIframe());
    }

    return () => subscription?.remove();
  }, []);

  const getModalStyle = (): ViewStyle => {
    const { width, height } = screenDimensions;
    let modalWidth: DimensionValue = '90%';
    let modalHeight: DimensionValue | undefined = undefined;
    let maxWidth = 600;
    let maxHeight = height * 0.9;

    // Responsive sizing based on screen size and modal size prop
    if (isMobile || isIframe) {
      // Mobile or iframe - use more screen space
      modalWidth = '95%';
      maxWidth = width - 40;
      maxHeight = height * 0.95;

      switch (size) {
        case 'small':
          maxWidth = Math.min(400, width - 40);
          break;
        case 'medium':
          maxWidth = Math.min(600, width - 40);
          break;
        case 'large':
          maxWidth = Math.min(800, width - 40);
          break;
        case 'fullscreen':
          modalWidth = '100%';
          modalHeight = '100%';
          maxWidth = width;
          maxHeight = height;
          break;
      }
    } else {
      // Desktop - more conservative sizing
      switch (size) {
        case 'small':
          maxWidth = 400;
          modalWidth = '30%';
          break;
        case 'medium':
          maxWidth = 600;
          modalWidth = '50%';
          break;
        case 'large':
          maxWidth = 800;
          modalWidth = '70%';
          break;
        case 'fullscreen':
          modalWidth = '95%';
          modalHeight = '95%';
          maxWidth = width * 0.95;
          maxHeight = height * 0.95;
          break;
      }
    }

    const style: ViewStyle = {
      width: modalWidth,
      maxWidth,
      maxHeight,
    };

    if (modalHeight !== undefined) {
      style.height = modalHeight;
    }

    return style;
  };

  return (
    <RNModal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : 'overFullScreen'}
    >
      <View style={[
        styles.overlay,
        isMobile && styles.overlayMobile,
        isIframe && styles.overlayIframe
      ]}>
        <View style={[
          styles.modal,
          getModalStyle(),
          isMobile && styles.modalMobile,
          isIframe && styles.modalIframe,
          size === 'fullscreen' && styles.modalFullscreen,
          style
        ]}>
          {children}
        </View>
      </View>
    </RNModal>
  );
};

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  return (
    <View style={[styles.header, isMobile && styles.headerMobile]}>
      <Text style={[styles.title, isMobile && styles.titleMobile]}>{title}</Text>
      <TouchableOpacity 
        onPress={onClose} 
        style={[styles.closeButton, isMobile && styles.closeButtonMobile]}
      >
        <Text style={[styles.closeText, isMobile && styles.closeTextMobile]}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

export const ModalContent: React.FC<ModalContentProps> = ({ children, style }) => {
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

  useEffect(() => {
    const updateHeight = () => {
      setScreenHeight(Dimensions.get('window').height);
    };

    const subscription = Dimensions.addEventListener('change', updateHeight);
    return () => subscription?.remove();
  }, []);

  return (
    <ScrollView
      style={[styles.content, style]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={Platform.OS !== 'web'}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
    >
      {children}
    </ScrollView>
  );
};

export const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  return (
    <View style={[styles.footer, isMobile && styles.footerMobile]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  overlayMobile: {
    padding: theme.spacing.sm,
  },
  overlayIframe: {
    // Ensure overlay works well in iframe
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    // Ensure modal content is scrollable if needed
    maxHeight: '90%',
    minHeight: 300,
  },
  modalMobile: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    margin: theme.spacing.sm,
    minHeight: 250,
  },
  modalIframe: {
    // Iframe-specific optimizations
    maxHeight: '95%',
    width: '90%',
    maxWidth: 600,
  },
  modalFullscreen: {
    borderRadius: 0,
    margin: 0,
    padding: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  headerMobile: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.font.sizeHeading,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.font.family,
    flex: 1,
  },
  titleMobile: {
    fontSize: 18,
  },
  closeButton: {
    padding: theme.spacing.md,
    marginRight: -theme.spacing.md,
    marginTop: -theme.spacing.md,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonMobile: {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
    marginTop: -theme.spacing.sm,
  },
  closeText: {
    fontSize: 28,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  closeTextMobile: {
    fontSize: 24,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    marginTop: theme.spacing.md,
  },
  footerMobile: {
    flexDirection: 'column-reverse',
    gap: theme.spacing.sm,
    alignItems: 'stretch',
  },
}); 