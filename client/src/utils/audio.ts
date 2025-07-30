const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const compressor = audioCtx.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
compressor.knee.setValueAtTime(30, audioCtx.currentTime);
compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
compressor.connect(audioCtx.destination);

const createReverb = () => {
  const convolver = audioCtx.createConvolver();
  const reverbTime = 1.2;
  const sampleRate = audioCtx.sampleRate;
  const length = sampleRate * reverbTime;
  const impulse = audioCtx.createBuffer(2, length, sampleRate);
  
  for(let channel = 0; channel < 2; channel++){
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const decay = Math.pow(1 - i / length, 1.5);
      channelData[i] = (Math.random() * 2 - 1) * decay * 0.3;
    }
  }
  
  convolver.buffer = impulse;
  return convolver;
};

const reverb = createReverb();
const reverbGain = audioCtx.createGain();
reverbGain.gain.value = 0.15;
reverb.connect(reverbGain);
reverbGain.connect(compressor);

const activeNotes = new Map<string, { oscillator: OscillatorNode, gainNode: GainNode }>();

export const playNote = (key: string) => {
  if (activeNotes.has(key)) {
    stopNote(key);
  }

  const noteMap: Record<string, number> = {
    // Octave 3 (lower notes)
    'q': 130.81,  // C3
    '2': 138.59,  // C#3
    'w': 146.83,  // D3
    '3': 155.56,  // D#3
    'e': 164.81,  // E3
    'r': 174.61,  // F3
    '5': 185.00,  // F#3
    't': 196.00,  // G3
    '6': 207.65,  // G#3
    'y': 220.00,  // A3
    '7': 233.08,  // A#3
    'u': 246.94,  // B3
    
    // Octave 4 (middle notes)
    'i': 261.63,  // C4
    '9': 277.18,  // C#4
    'o': 293.66,  // D4
    '0': 311.13,  // D#4
    'p': 329.63,  // E4
    'z': 349.23,  // F4
    's': 369.99,  // F#4
    'x': 392.00,  // G4
    'd': 415.30,  // G#4
    'c': 440.00,  // A4
    'f': 466.16,  // A#4
    'v': 493.88,  // B4
    
    // Octave 5 (higher notes)
    'b': 523.25,  // C5
    'h': 554.37,  // C#5
    'n': 587.33,  // D5
    'j': 622.25,  // D#5
    'm': 659.25,  // E5
    ',': 698.46,  // F5
    'l': 739.99,  // F#5
    '.': 783.99,  // G5
    ';': 830.61,  // G#5
    '/': 880.00,  // A5
    "'": 932.33,  // A#5
    '\\': 987.77, // B5
  };

  const baseFreq = noteMap[key] || 440;
  const now = audioCtx.currentTime;
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.frequency.value = baseFreq;
  oscillator.type = 'triangle';
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  
  if(baseFreq < 200){
    filter.frequency.value = baseFreq * 6;
    filter.Q.value = 0.8;
  }else if (baseFreq > 600){
    filter.frequency.value = baseFreq * 3;
    filter.Q.value = 1.2;
  } else {
    filter.frequency.value = baseFreq * 4;
    filter.Q.value = 1;
  }
  
  const dryGain = audioCtx.createGain();
  const wetGain = audioCtx.createGain();
  dryGain.gain.value = 0.85;
  wetGain.gain.value = 0.25;
  
  oscillator.connect(gainNode);
  gainNode.connect(filter);
  
  filter.connect(dryGain);
  filter.connect(wetGain);
  dryGain.connect(compressor);
  wetGain.connect(reverb);

  let attackTime, decayTime, sustainLevel, releaseTime;
  
  if(baseFreq < 200){

    attackTime = 0.005;
    decayTime = 0.15;
    sustainLevel = 0.25;
    releaseTime = 1.8;
  } else if (baseFreq > 600) {
    attackTime = 0.001;
    decayTime = 0.08;
    sustainLevel = 0.15;
    releaseTime = 0.8;
  } else {
    attackTime = 0.002;
    decayTime = 0.1;
    sustainLevel = 0.2;
    releaseTime = 1.2;
  }
  
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.8, now + attackTime);
  gainNode.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + attackTime + decayTime + releaseTime);

  oscillator.start(now);
  oscillator.stop(now + attackTime + decayTime + releaseTime);

  activeNotes.set(key, { oscillator, gainNode });

  setTimeout(() => {
    activeNotes.delete(key);
  }, (attackTime + decayTime + releaseTime) * 1000);
};

export const stopNote = (key: string) => {
  const note = activeNotes.get(key);
  if (note) {
    const now = audioCtx.currentTime;
    note.gainNode.gain.cancelScheduledValues(now);
    note.gainNode.gain.setValueAtTime(note.gainNode.gain.value, now);
    note.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    try {
      note.oscillator.stop(now + 0.2);
    } catch (e) {}
    
    activeNotes.delete(key);
  }
};

export const resumeAudioContext = () => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};
