import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@ohif/ui-next';
import { useTranslation } from 'react-i18next';
import i18n from '@ohif/i18n';

/**
 * Props for the MultiLabelInput component
 */
interface MultiLabelInputProps {
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Additional CSS class name for the input field */
  className?: string;
  /** Array of labels to display */
  labels?: string[];
  /** Callback function called when labels are added or removed */
  onLabelsChange?: (labels: string[]) => void;
}

/**
 * A component that allows users to input and manage multiple text labels
 * @param props - Component props
 * @returns The MultiLabelInput component
 */
const MultiLabelInput: React.FC<MultiLabelInputProps> = ({
  placeholder = 'Enter a label and press Enter',
  className,
  labels = [],
  onLabelsChange,
}) => {
  const { i18n: i18nextInstance } = useTranslation();
  const [lang, setLang] = useState(i18nextInstance?.language || i18n.language);

  useEffect(() => {
    const handleLanguageChanged = () => {
      setLang(i18n.language);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const translatePlaceholder = useCallback(() => {
    return i18n.t(placeholder, { ns: 'USAnnotationPanel', defaultValue: placeholder });
  }, [lang, placeholder]);

  const translatedPlaceholder = translatePlaceholder();

  // State for the current input value
  const [inputValue, setInputValue] = useState<string>('');
  // Internal state for labels that syncs with the external labels prop
  const [internalLabels, setInternalLabels] = useState<string[]>(labels);

  // Update internal labels when external labels change
  useEffect(() => {
    setInternalLabels(labels);
  }, [labels]);

  /**
   * Handles changes to the input field
   * @param e - The change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  /**
   * Adds the current input value as a new label if it's not empty and not a duplicate
   */
  const handleAddLabel = () => {
    if (inputValue.trim() && !internalLabels.includes(inputValue.trim())) {
      const newLabels = [...internalLabels, inputValue.trim()];
      setInternalLabels(newLabels);
      if (onLabelsChange) {
        onLabelsChange(newLabels);
      }
      setInputValue('');
    }
  };

  /**
   * Removes a label from the list
   * @param label - The label to remove
   */
  const handleRemoveLabel = (label: string) => {
    const newLabels = internalLabels.filter(l => l !== label);
    setInternalLabels(newLabels);
    if (onLabelsChange) {
      onLabelsChange(newLabels);
    }
  };

  /**
   * Handles key press events in the input field
   * @param e - The keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddLabel();
    }
  };

  return (
    <div>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={translatedPlaceholder}
        className={className}
      />
      <div className="flex flex-wrap">
        {internalLabels.map((label, index) => (
          <span
            key={index}
            className="text-foreground m-1 inline-flex items-center rounded-full bg-[#2a2a4a] px-4 py-1"
          >
            {label}
            <button
              className="text-foreground ml-2.5 cursor-pointer rounded-full bg-blue-800 px-2 py-0.5 text-xs transition-colors hover:bg-blue-600"
              onClick={() => handleRemoveLabel(label)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MultiLabelInput;
