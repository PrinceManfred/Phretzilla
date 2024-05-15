export interface ITuning {
  getFrequency(note: Note): number;
}

export interface Interval {
  name: string;
  offset: number;
}

export enum NoteNames {
  Cb,
  C,
  Cs,
  Db,
  D,
  Ds,
  Eb,
  E,
  Fb,
  Es,
  F,
  Fs,
  Gb,
  G,
  Gs,
  Ab,
  A,
  As,
  Bb,
  B
}

export type Octave = number;

export type Note = {
  name: NoteNames;
  octave: Octave;
};

export type NoteValue = Note & {
  frequency: number;
};

export class TwelveTet implements ITuning {
  private static OFFSETS: Record<NoteNames, number> = {
    [NoteNames.Cb]: -10,
    [NoteNames.C]: -9,
    [NoteNames.Cs]: -8,
    [NoteNames.Db]: -8,
    [NoteNames.D]: -7,
    [NoteNames.Ds]: -6,
    [NoteNames.Eb]: -6,
    [NoteNames.E]: -5,
    [NoteNames.Fb]: -5,
    [NoteNames.Es]: -4,
    [NoteNames.F]: -4,
    [NoteNames.Fs]: -3,
    [NoteNames.Gb]: -3,
    [NoteNames.G]: -2,
    [NoteNames.Gs]: -1,
    [NoteNames.Ab]: -1,
    [NoteNames.A]: 0,
    [NoteNames.As]: 1,
    [NoteNames.Bb]: 1,
    [NoteNames.B]: 2
  };

  referenceFrequency: number;
  constructor(referenceFrequency: number = 440) {
    this.referenceFrequency = referenceFrequency;
  }

  getFrequency(note: Note): number {
    let offset = TwelveTet.OFFSETS[note.name];
    if (offset == null) return 0;
    const octaveOffset = (note.octave - 4) * 12;
    offset += octaveOffset;

    return this.referenceFrequency * Math.pow(2, offset / 12);
  }

  getNoteRange(start: Note, end: Note): NoteValue[] {
    if (this.getAbsoluteOffset(start) > this.getAbsoluteOffset(end)) return [];
    const range: NoteValue[] = [];
    let trueStart: Note;
    let trueEnd: Note;

    switch (start.name) {
      case NoteNames.Cb:
        trueStart = { name: NoteNames.B, octave: start.octave - 1 };
        break;
      case NoteNames.Db:
        trueStart = { name: NoteNames.Cs, octave: start.octave };
        break;
      case NoteNames.Eb:
        trueStart = { name: NoteNames.Ds, octave: start.octave };
        break;
      case NoteNames.Fb:
        trueStart = { name: NoteNames.E, octave: start.octave };
        break;
      case NoteNames.F:
        trueStart = { name: NoteNames.Es, octave: start.octave };
        break;
      case NoteNames.Gb:
        trueStart = { name: NoteNames.Fs, octave: start.octave };
        break;
      case NoteNames.Ab:
        trueStart = { name: NoteNames.Gs, octave: start.octave };
        break;
      case NoteNames.Bb:
        trueStart = { name: NoteNames.As, octave: start.octave };
        break;
      default:
        trueStart = start;
    }

    switch (end.name) {
      case NoteNames.B:
        trueEnd = { name: NoteNames.Cb, octave: end.octave + 1 };
        break;
      case NoteNames.Cs:
        trueEnd = { name: NoteNames.Db, octave: end.octave };
        break;
      case NoteNames.Ds:
        trueEnd = { name: NoteNames.Eb, octave: end.octave };
        break;
      case NoteNames.E:
        trueEnd = { name: NoteNames.Fb, octave: end.octave };
        break;
      case NoteNames.Es:
        trueEnd = { name: NoteNames.F, octave: end.octave };
        break;
      case NoteNames.Fs:
        trueEnd = { name: NoteNames.Gb, octave: end.octave };
        break;
      case NoteNames.Gs:
        trueEnd = { name: NoteNames.Ab, octave: end.octave };
        break;
      case NoteNames.As:
        trueEnd = { name: NoteNames.Bb, octave: end.octave };
        break;
      default:
        trueEnd = end;
    }

    for (let i = trueStart.name; i <= NoteNames.B; i++) {
      const newNote: Note = { name: i, octave: trueStart.octave };
      range.push({ ...newNote, frequency: this.getFrequency(newNote) });
      if (newNote.name == trueEnd.name && newNote.octave == trueEnd.octave) return range;
    }

    let currentOctave = trueStart.octave + 1;
    while (currentOctave <= trueEnd.octave) {
      for (let i = NoteNames.Cb; i <= NoteNames.B; i++) {
        const newNote: Note = { name: i, octave: currentOctave };
        range.push({ ...newNote, frequency: this.getFrequency(newNote) });
        if (newNote.name == trueEnd.name && newNote.octave == trueEnd.octave) return range;
      }
      currentOctave++;
    }

    return range;
  }

  getAbsoluteOffset(note: Note): number {
    const offset = TwelveTet.OFFSETS[note.name];
    const octaveOffset = (note.octave - 4) * 12;

    return offset + octaveOffset;
  }
}
