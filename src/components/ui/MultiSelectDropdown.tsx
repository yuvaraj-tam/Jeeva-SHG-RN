import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
  FlatList,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { theme } from '../../theme';

interface Option {
  id: string;
  label: string;
  subtitle?: string;
}

interface MultiSelectDropdownProps {
  label: string;
  placeholder?: string;
  options: Option[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  maxHeight?: number;
  error?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  placeholder = 'Select options...',
  options,
  selectedIds,
  onSelectionChange,
  required = false,
  disabled = false,
  maxHeight = 200,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const [pendingSelectedIds, setPendingSelectedIds] = useState<string[]>(selectedIds);
  const searchInputRef = useRef<TextInput>(null);

  // Filter options based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (option.subtitle && option.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredOptions(filtered);
    }
  }, [searchQuery, options]);

  // Keep pendingSelectedIds in sync with selectedIds when modal opens
  useEffect(() => {
    if (isOpen) setPendingSelectedIds(selectedIds);
  }, [isOpen, selectedIds]);

  const toggleOption = (optionId: string) => {
    const newSelectedIds = pendingSelectedIds.includes(optionId)
      ? pendingSelectedIds.filter(id => id !== optionId)
      : [...pendingSelectedIds, optionId];
    setPendingSelectedIds(newSelectedIds);
  };

  const getSelectedLabels = () => {
    const selectedOptions = options.filter(option => selectedIds.includes(option.id));
    if (selectedOptions.length === 0) return placeholder;
    if (selectedOptions.length === 1) return selectedOptions[0].label;
    return `${selectedOptions.length} borrowers selected`;
  };

  const openDropdown = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery('');
      // Focus search input after modal opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleOk = () => {
    onSelectionChange(pendingSelectedIds);
    closeDropdown();
  };

  const handleCancel = () => {
    closeDropdown();
  };

  const renderOption = ({ item }: { item: Option }) => {
    const isSelected = pendingSelectedIds.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.option,
          isSelected && styles.optionSelected
        ]}
        onPress={() => toggleOption(item.id)}
      >
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionLabel,
            isSelected && styles.optionLabelSelected
          ]}>
            {item.label}
          </Text>
          {item.subtitle && (
            <Text style={[
              styles.optionSubtitle,
              isSelected && styles.optionSubtitleSelected
            ]}>
              {item.subtitle}
            </Text>
          )}
        </View>
        <View style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected
        ]}>
          {isSelected && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
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
          selectedIds.length === 0 && styles.placeholderText
        ]}>
          {getSelectedLabels()}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      {error ? <Text style={{ color: theme.colors.error, marginTop: 4 }}>{error}</Text> : null}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          {/* Overlay for outside clicks */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={handleCancel}
          />
          {/* Modal content, prevent propagation */}
          <Pressable>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search borrowers..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={Platform.OS === 'web'}
              />
              <FlatList
                data={filteredOptions}
                renderItem={renderOption}
                keyExtractor={(item) => item.id}
                style={[styles.optionsList, { maxHeight }]}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              />
              {filteredOptions.length === 0 && (
                <Text style={styles.noResultsText}>
                  {searchQuery ? 'No borrowers found matching your search.' : 'No borrowers available.'}
                </Text>
              )}
              <View style={styles.modalFooterRow}>
                <Text style={styles.selectionInfo}>
                  {pendingSelectedIds.length} of {options.length} borrowers selected
                </Text>
                <TouchableOpacity style={styles.okButton} onPress={handleOk}>
                  <Text style={styles.okButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
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
    height: Platform.OS === 'web' ? 400 : undefined,
    maxHeight: Platform.OS === 'web' ? undefined : '80%',
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
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.lg,
    fontSize: theme.font.size,
    backgroundColor: theme.colors.background,
    fontFamily: theme.font.family,
  },
  optionsList: {
    flex: 1,
    maxHeight: 250,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.primary + '10',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  optionLabelSelected: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  optionSubtitle: {
    fontSize: theme.font.size - 2,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontFamily: theme.font.family,
  },
  optionSubtitleSelected: {
    color: theme.colors.primary + '80',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  noResultsText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.font.size,
    fontStyle: 'italic',
    padding: theme.spacing.lg,
    fontFamily: theme.font.family,
  },
  modalFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  selectionInfo: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.font.size - 1,
    fontFamily: theme.font.family,
  },
  okButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  okButtonText: {
    color: theme.colors.surface,
    fontWeight: '600',
    fontSize: theme.font.size,
    fontFamily: theme.font.family,
  },
}); 