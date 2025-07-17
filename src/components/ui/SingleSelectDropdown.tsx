import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  FlatList,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { theme } from '../../theme';

interface Option {
  id: string;
  label: string;
}

interface SingleSelectDropdownProps {
  label: string;
  placeholder?: string;
  options: Option[];
  selectedId: string;
  onSelectionChange: (selectedId: string) => void;
  required?: boolean;
  disabled?: boolean;
  maxHeight?: number;
  error?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const SingleSelectDropdown: React.FC<SingleSelectDropdownProps> = ({
  label,
  placeholder = 'Select option...',
  options,
  selectedId,
  onSelectionChange,
  required = false,
  disabled = false,
  maxHeight = 200,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectOption = (optionId: string) => {
    onSelectionChange(optionId);
    setIsOpen(false);
  };

  const getSelectedLabel = () => {
    const selectedOption = options.find(option => option.id === selectedId);
    return selectedOption ? selectedOption.label : placeholder;
  };

  const openDropdown = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const renderOption = ({ item }: { item: Option }) => {
    const isSelected = selectedId === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.option,
          isSelected && styles.optionSelected
        ]}
        onPress={() => selectOption(item.id)}
      >
        <Text style={[
          styles.optionLabel,
          isSelected && styles.optionLabelSelected
        ]}>
          {item.label}
        </Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.dropdown,
          disabled && styles.dropdownDisabled
        ]}
        onPress={openDropdown}
        disabled={disabled}
      >
        <Text style={[
          styles.dropdownText,
          !selectedId && styles.placeholderText
        ]}>
          {getSelectedLabel()}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      {error ? <Text style={{ color: theme.colors.error, marginTop: 4 }}>{error}</Text> : null}
      
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <View style={styles.modalOverlay}>
          {/* Overlay for outside clicks */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={closeDropdown}
          />
          {/* Modal content, prevent propagation */}
          <Pressable>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={closeDropdown}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={options}
                renderItem={renderOption}
                keyExtractor={(item) => item.id}
                style={[styles.optionsList, { maxHeight }]}
                showsVerticalScrollIndicator={true}
              />
            </View>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.font.family,
  },
  required: {
    color: theme.colors.error,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  dropdownDisabled: {
    backgroundColor: theme.colors.textMuted,
    opacity: 0.6,
  },
  dropdownText: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.font.family,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  dropdownArrow: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    width: Platform.OS === 'web' ? Math.min(400, screenWidth - 40) : '100%',
    maxHeight: Platform.OS === 'web' ? 400 : '70%',
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.font.sizeHeading,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  closeButton: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    padding: theme.spacing.xs,
  },
  optionsList: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.primary + '10',
  },
  optionLabel: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    flex: 1,
  },
  optionLabelSelected: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 