import { SymbolView } from 'expo-symbols';
import { MotiView } from 'moti';
import React, { useState, ChangeEvent, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, TextInput, Pressable } from 'react-native';

interface SearchInputProps {
  placeholder?: string;
  onChange: (value: string) => void;
  setIsFocused: (value: boolean) => void;
  value: string | undefined;
  className?: string;
}

const SearchInput = forwardRef(
  (
    { placeholder = 'Search...', onChange, setIsFocused, value, className }: SearchInputProps,
    ref
  ) => {
    const [inputValue, setInputValue] = useState(value || '');
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      clear: () => {
        setInputValue('');
        onChange('');
      },
    }));
    React.useEffect(() => {
      setInputValue(value || '');
    }, [value]);

    const handleInputChange = (text: string) => {
      setInputValue(text);
      onChange(text);
    };

    const handleClear = () => {
      setInputValue('');
      onChange('');
      inputRef.current?.focus();
    };

    return (
      <View className="relative flex-1">
        <TextInput
          ref={inputRef}
          className={` ${className}`}
          onChangeText={handleInputChange}
          style={{ fontSize: 18 }}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          // autoCapitalize="none"
          value={value}
          autoCorrect={false}
          autoFocus
        />
        {inputValue !== '' && (
          <Pressable
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2"
            onPress={handleClear}>
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: inputValue ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'timing', duration: 500 }}>
              <SymbolView
                name="x.circle.fill"
                type="palette"
                colors={['white', 'gray']}
                size={17}
              />
            </MotiView>
          </Pressable>
        )}
      </View>
    );
  }
);

export default SearchInput;
