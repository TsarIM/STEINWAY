export const pianoKeys = [
    //octave 3
    ['q', 'white'],
    ['2', 'black'],
    ['w', 'white'],
    ['3', 'black'],
    ['e', 'white'],

    ['r', 'white'],
    ['5', 'black'],
    ['t', 'white'],
    ['6', 'black'],
    ['y', 'white'],
    ['7', 'black'],
    ['u', 'white'],

    //octave 4
    ['i', 'white'],
    ['9', 'black'],
    ['o', 'white'],
    ['0', 'black'],
    ['p', 'white'],

    ['z', 'white'],
    ['s', 'black'],
    ['x', 'white'],
    ['d', 'black'],
    ['c', 'white'],
    ['f', 'black'],
    ['v', 'white'],

    //octave 5
    ['b', 'white'],
    ['h', 'black'],
    ['n', 'white'],
    ['j', 'black'],
    ['m', 'white'],

    [',', 'white'],
    ['l', 'black'],
    ['.', 'white'],
    [';', 'black'],
    ['/', 'white'],
    [`'`, 'black'],
    ['\\', 'white']
] as const;
  
export const validPianoKeys = pianoKeys.map(([key]) => key);
export type PianoKeyType = typeof validPianoKeys[number];
  