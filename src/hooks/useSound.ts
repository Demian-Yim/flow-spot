'use client'

import { useCallback, useRef } from 'react'

type SoundType = 'click' | 'success' | 'error' | 'notification' | 'start' | 'end'

const soundFrequencies: Record<SoundType, { frequency: number; duration: number }> = {
  click: { frequency: 800, duration: 100 },
  success: { frequency: 1000, duration: 200 },
  error: { frequency: 400, duration: 200 },
  notification: { frequency: 600, duration: 150 },
  start: { frequency: 800, duration: 300 },
  end: { frequency: 1200, duration: 200 },
}

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioContextRef.current = new AudioCtx()
    }
    return audioContextRef.current
  }, [])

  const playSound = useCallback(
    (type: SoundType) => {
      if (typeof window === 'undefined') return

      try {
        const audioContext = getAudioContext()
        const { frequency, duration } = soundFrequencies[type]

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = frequency
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration / 1000)
      } catch (error) {
        console.error('Error playing sound:', error)
      }
    },
    [getAudioContext]
  )

  const playCustomTone = useCallback(
    (frequency: number, duration: number, volume: number = 0.3) => {
      if (typeof window === 'undefined') return

      try {
        const audioContext = getAudioContext()

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = frequency
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration / 1000)
      } catch (error) {
        console.error('Error playing custom tone:', error)
      }
    },
    [getAudioContext]
  )

  const playSuccessSequence = useCallback(() => {
    if (typeof window === 'undefined') return

    setTimeout(() => playSound('success'), 0)
    setTimeout(() => playSound('success'), 150)
    setTimeout(() => playSound('success'), 300)
  }, [playSound])

  const playCelebrateSound = useCallback(() => {
    if (typeof window === 'undefined') return

    playCustomTone(400, 100)
    setTimeout(() => playCustomTone(600, 100), 100)
    setTimeout(() => playCustomTone(800, 100), 200)
    setTimeout(() => playCustomTone(1000, 200), 300)
  }, [playCustomTone])

  return {
    playSound,
    playCustomTone,
    playSuccessSequence,
    playCelebrateSound,
  }
}
