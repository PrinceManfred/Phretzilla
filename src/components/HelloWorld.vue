<script setup lang="ts">
import { Interval, Note, Range } from 'tonal';
import type { Note as NoteType } from '@tonaljs/pitch-note';
import * as NotePlus from '@/utilities/NotePlus';
import { onBeforeMount, ref, watch } from 'vue';

let audioCtx: AudioContext;

const openNote = ref<string>('E2');
const fretCount = ref<string | null>('22');
const bpm = ref(80);
const noteList = ref<NoteType[]>([]);
const currentNote = ref<string>('');
const isPlaying = ref(false);
const showFlats = ref(true);
const showSharps = ref(true);
const showNaturals = ref(true);
const volume = ref(50);
let ticker: ReturnType<typeof setInterval> | undefined;

// create Oscillator node
let oscillator: OscillatorNode;
let gain: GainNode | null;
function play() {
  if (!isPlaying.value) setupAudio();
  const freq = Note.freq(currentNote.value) ?? 0;
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
}

function setupAudio() {
  audioCtx = new AudioContext();
  gain = audioCtx.createGain();
  gain.gain.setValueAtTime(volume.value / 100, audioCtx.currentTime);
  gain.connect(audioCtx.destination);
  oscillator = audioCtx.createOscillator();
  oscillator.type = 'square';
  oscillator.connect(gain);
  oscillator.start();
}

function setString() {
  let frets = parseInt(fretCount.value ?? '22');

  if (isNaN(frets) || frets < 1) {
    frets = 22;
  }

  fretCount.value = frets.toString();

  const lastNote = Note.transpose(openNote.value, Interval.fromSemitones(frets));
  const notes = Range.chromatic([openNote.value, lastNote]);
  const enharmonics = notes.map((v) => NotePlus.enharmonic(v));
  noteList.value = Note.sortedUniqNames([...notes, ...enharmonics])
    .map((v) => Note.get(v))
    .filter((v) => {
      if (!showNaturals.value && !showSharps.value && !showFlats.value) return true;
      if (v.acc == 'b' && !showFlats.value) return false;
      if (v.acc == '#' && !showSharps.value) return false;
      if (v.acc == '' && !showNaturals.value) return false;
      return true;
    });
}

function setTempo() {
  if (isPlaying.value) start();
}

function start() {
  if (ticker != null) clearInterval(ticker);
  currentNote.value = noteList.value[Math.floor(Math.random() * noteList.value.length)].name;
  play();
  ticker = setInterval(function ticker() {
    let newNote;
    do {
      newNote = noteList.value[Math.floor(Math.random() * noteList.value.length)].name;
    } while (newNote == currentNote.value);
    currentNote.value = newNote;
    play();
  }, 240_000 / bpm.value);
}

function stop() {
  if (ticker != null) clearInterval(ticker);
  audioCtx?.close();
  gain = null;
}

function togglePlayback() {
  if (isPlaying.value) {
    stop();
    isPlaying.value = false;
  } else {
    start();
    isPlaying.value = true;
  }
}

onBeforeMount(() => {
  setString();
});

watch(volume, () => {
  if (gain == null) return;
  gain.gain.exponentialRampToValueAtTime(volume.value / 100, audioCtx.currentTime);
});
</script>

<template>
  <div style="text-align: center">
    <div>
      <input v-model="openNote" @blur="setString" />
      <input v-model="fretCount" @blur="setString" />
      <input v-model="bpm" @blur="setTempo" />
      <br />
      <input type="checkbox" name="naturals" v-model="showNaturals" @change="setString" />
      <label for="sharps">Naturals</label><br />
      <input type="checkbox" name="flats" v-model="showFlats" @change="setString" />
      <label for="flats">Flats</label><br />
      <input type="checkbox" name="sharps" v-model="showSharps" @change="setString" />
      <label for="sharps">Sharps</label><br />
      <button @click="togglePlayback">{{ isPlaying ? 'Stop' : 'Play' }}</button>
      <br />
      <input v-model="volume" name="volume" type="range" min="1" max="100" />
      <label for="volume">Volume</label>
    </div>
    <div>
      <h1>{{ currentNote }}</h1>
    </div>
  </div>
</template>
