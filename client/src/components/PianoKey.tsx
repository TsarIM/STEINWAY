import React from 'react';

interface PianoKeyProps {
  note: string;
  type?: 'white' | 'black';
  handleKeyPress: (note: string) => void;
  activeKeys: Set<string>;
}

const PianoKey: React.FC<PianoKeyProps> = ({
  note,
  type = 'white',
  handleKeyPress,
  activeKeys,
}) => {
  return (
    <button
      onClick={() => handleKeyPress(note)}
      className={`piano-key ${type} ${activeKeys.has(note) ? 'active' : ''}`}
    >
      {note}
    </button>
  );
};

export default PianoKey;
