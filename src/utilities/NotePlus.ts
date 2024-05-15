import { Note } from 'tonal';

export function enharmonic(noteName: string): string {
  let targetClass: undefined | string = undefined;
  switch (Note.pitchClass(noteName)) {
    case 'B':
      targetClass = 'Cb';
      break;
    case 'C':
      targetClass = 'B#';
      break;
    case 'E':
      targetClass = 'Fb';
      break;
    case 'F':
      targetClass = 'E#';
      break;
  }
  return Note.enharmonic(noteName, targetClass);
}
