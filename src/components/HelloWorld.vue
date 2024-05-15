<script setup lang="ts">
import { Interval, Note, Range } from 'tonal';
import type { Note as NoteType } from '@tonaljs/pitch-note';
import * as NotePlus from '@/utilities/NotePlus';
import { onBeforeMount, ref } from 'vue';

let audioCtx: AudioContext;

const openNote = ref<string>('E2');
const fretCount = ref(22);
const bpm = ref(80);
const noteList = ref<NoteType[]>([]);
const currentNote = ref<string>('');
const isPlaying = ref(false);
let ticker: number | undefined;

// create Oscillator node
let oscillator: OscillatorNode;
function play() {
  if (!isPlaying.value) setupAudio();
  const freq = Note.freq(currentNote.value) ?? 0;
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
}

function setupAudio() {
  audioCtx = new AudioContext();
  oscillator = audioCtx.createOscillator();
  oscillator.type = 'square';
  oscillator.connect(audioCtx.destination);
  oscillator.start();
}

function setString() {
  const lastNote = Note.transpose(openNote.value, Interval.fromSemitones(fretCount.value));
  const notes = Range.chromatic([openNote.value, lastNote]);
  const enharmonics = notes.map((v) => NotePlus.enharmonic(v));
  noteList.value = Note.sortedUniqNames([...notes, ...enharmonics]).map((v) => Note.get(v));
}

function setTempo() {
  if (isPlaying.value) start();
}

function start() {
  if (ticker != null) clearInterval(ticker);
  currentNote.value = noteList.value[Math.floor(Math.random() * noteList.value.length)].name;
  play();
  ticker = setInterval(function ticker() {
    currentNote.value = noteList.value[Math.floor(Math.random() * noteList.value.length)].name;
    play();
  }, 240_000 / bpm.value);
}

function stop() {
  if (ticker != null) clearInterval(ticker);
  audioCtx?.close();
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
</script>

<template>
  <div style="text-align: center">
    <div>
      <input v-model="openNote" @blur="setString" />
      <input v-model="fretCount" @blur="setString" />
      <input v-model="bpm" @blur="setTempo" />
      <button @click="togglePlayback">{{ isPlaying ? 'Stop' : 'Play' }}</button>
    </div>
    <div>
      <h1>{{ currentNote }}</h1>
    </div>
  </div>
</template>
