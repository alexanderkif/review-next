'use client';

import { useId, useState } from 'react';
import { Textarea } from '@/components/ui/Input';

interface CommaSeparatedInputProps {
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
  id?: string;
}

const parseValues = (raw: string): string[] =>
  raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const formatValues = (values: string[]): string => values.join(', ');

/**
 * Edits a list of short strings as a single comma-separated textarea.
 *
 * The textarea keeps the raw text while typing so separators and trailing
 * spaces are not stripped mid-edit. The parsed array is normalized on blur and
 * whenever the external `value` changes (for example after a data reload).
 */
export default function CommaSeparatedInput({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint = 'Separate items with commas. Reorder them by editing the text.',
  id,
}: CommaSeparatedInputProps) {
  const generatedId = useId();
  const hintId = hint ? `${id || generatedId}-hint` : undefined;
  const [text, setText] = useState(() => formatValues(value));
  // Tracks the last formatted value we produced or received, so re-renders
  // caused by our own onChange do not overwrite what the user is typing.
  const [lastValue, setLastValue] = useState(() => formatValues(value));

  const formatted = formatValues(value);
  if (formatted !== lastValue) {
    // The value changed from the outside (e.g. data was reloaded).
    setLastValue(formatted);
    setText(formatted);
  }

  const handleChange = (raw: string) => {
    setText(raw);
    const parsed = parseValues(raw);
    setLastValue(formatValues(parsed));
    onChange(parsed);
  };

  const handleBlur = () => {
    const parsed = parseValues(text);
    const normalized = formatValues(parsed);
    setText(normalized);
    if (normalized !== lastValue) {
      setLastValue(normalized);
      onChange(parsed);
    }
  };

  return (
    <div>
      <Textarea
        id={id}
        label={label}
        rows={rows}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-describedby={hintId}
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}
