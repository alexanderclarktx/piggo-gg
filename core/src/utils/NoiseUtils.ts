
import { floor } from '@piggo-gg/core'
import { createNoise2D } from 'simplex-noise'

const Noise2D = createNoise2D(Math.random)

export const noise = (x: number, y: number) => {
  const n = Noise2D(x, y)
  return (n + 1) / 2
}

export type sampleProps = {
  x: number
  y: number
  factor: number
  octaves: number
}

export const sample = ({ x, y, factor, octaves }: sampleProps): number => {

  let value = 0

  for (let octave = 1; octave <= octaves; octave++) {
    const frequency = Math.pow(2, octave)
    const amplitude = Math.pow(0.5, octave)
    value += noise(x / 100 * frequency, y / 100 * frequency) * amplitude
  }

  return floor(value * factor)
}

export type Range<T> = [number, T][]

export const range = <T>(input: number, range: Range<T>): T => {
  if (range.length === 0) {
    throw new Error('Input and range must not be empty')
  }

  let result = range.at(-1)![1]

  for (const [threshold, value] of range) {
    if (input <= threshold) {
      result = value
      break
    }
  }

  return result
}
