import {Note} from 'octavian'
import Oscillator from './oscillator.js'
import Noise from './noise.js';

export default function Synthesizer(Context) {
  const context = new Context()
  const nodes = {}
  let tone = {oscillators: [], noises: []}
  let sounds = {}

  return {
    play(name) {
      if (sounds[name]) {
        sounds[name].oscillators.forEach(osc => osc.play(true))
        sounds[name].noises.forEach(noise => noise.play())
        return
      }

      const note = new Note(name)
      const freq = note.frequency

      nodes[freq] = createOscillators(context, tone.oscillators, freq)
      nodes[freq].forEach(osc => osc.play())
    },

    stop(name) {
      if (sounds[name]) {
        sounds[name].oscillators.forEach(osc => osc.stop())
        sounds[name].noises.forEach(noise => noise.stop())
        return
      }

      const note = new Note(name)
      const freq = note.frequency

      if (nodes[freq] === undefined) {
        throw new Error(`Cannot stop note ${name} before it is played.`)
      }

      nodes[freq].forEach(osc => osc.stop())
    },

    setTone({oscillators = [], noises = []} = {}) {
      tone.oscillators = oscillators
      tone.noises = noises
    },

    addSound(name, {oscillators = [], noises = []} = {}) {
      sounds[name] = {
        oscillators: createOscillators(context, oscillators),
        noises: createNoises(context, noises)
      }
    },

    removeSound(name) {
      const success = delete sounds[name]
      if (!success) {
        throw new Error(`Could not delete sound named ${name}.`)
      }
    }
  }
}

function createOscillators(context, oscillators, frequency) {
  return oscillators.map(osc => {
    return new Oscillator(context, {
      waveform: osc.waveform,
      volume: osc.volume,
      decay: osc.decay,
      decayNote: osc.decayNote,
      frequency: frequency || osc.frequency
    })
  })
}

function createNoises(context, noises) {
  return noises.map(noise => {
    return new Noise(context, {
      volume: noise.volume,
      frequency: noise.frequency,
      decay: noise.decay,
      filter: noise.filter
    })
  })
}
