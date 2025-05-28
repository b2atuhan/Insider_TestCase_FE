import { defineStore } from 'pinia'
import type { Horse, RaceRound, RaceResult } from '../types/horse'

// horse gifs we got (made with photoshop, not the best quality :)
const horseGifs = ['horse1.gif', 'horse2.gif', 'horse3.gif', 'horse4.gif']

// cool horse names
const horseNames = [
  'Bojack',
  'Blaze',
  'Shadow',
  'Comet',
  'Storm',
  'Rocket',
  'Majesty',
  'Spirit',
  'Lightning',
  'Duke',
  'Ranger',
  'Phantom',
  'Ace',
  'Bullet',
  'Chief',
  'Dash',
  'Hunter',
  'Blizzard',
  'Jet',
  'Flash',
]

// what we keep track of
interface HorseState {
  horses: Horse[]
  raceSchedule: RaceRound[]
  currentRace: number | null
  raceResults: RaceResult[]
  isRacing: boolean
  isGenerating: boolean
  error: string | null
}

export const useHorseStore = defineStore('horse', {
  state: (): HorseState => ({
    horses: [],
    raceSchedule: [],
    currentRace: null,
    raceResults: [],
    isRacing: false,
    isGenerating: false,
    error: null,
  }),

  actions: {
    // start fresh
    resetGame() {
      this.horses = []
      this.raceSchedule = []
      this.currentRace = null
      this.raceResults = []
      this.isRacing = false
      this.isGenerating = false
      this.error = null
    },

    // make some random horses
    generateHorses() {
      if (this.isRacing || this.isGenerating) {
        this.error = 'Cannot generate horses while racing or generating'
        return
      }

      try {
        this.isGenerating = true
        this.error = null
        // pretty colors for horses
        const colors = [
          '#FF0000',
          '#00FF00',
          '#0000FF',
          '#FFFF00',
          '#FF00FF',
          '#00FFFF',
          '#FFA500',
          '#800080',
          '#008000',
          '#800000',
          '#008080',
          '#000080',
          '#FFC0CB',
          '#A52A2A',
          '#808080',
          '#FFD700',
          '#4B0082',
          '#FF1493',
          '#00FF7F',
          '#FF4500',
        ]

        this.horses = Array.from({ length: 20 }, (_, index) => ({
          id: index + 1,
          name: horseNames[index],
          color: colors[index],
          acceleration: Math.floor(Math.random() * 100) + 1,
          topSpeed: Math.floor(Math.random() * 100) + 1,
          condition: Math.floor(Math.random() * 100) + 1,
          luck: Math.floor(Math.random() * 100) + 1,
          position: 0,
          currentSpeed: 0,
          finalPosition: null,
          finishTime: null,
          gif: horseGifs[Math.floor(Math.random() * horseGifs.length)],
        }))
      } catch (error) {
        this.error = 'Failed to generate horses'
        console.error('Error generating horses:', error)
      } finally {
        this.isGenerating = false
      }
    },

    // make a schedule for races
    generateRaceSchedule() {
      if (this.isRacing || this.isGenerating) {
        this.error = 'Cannot generate schedule while racing or generating'
        return
      }

      try {
        this.isGenerating = true
        this.error = null
        // different race lengths
        const distances = [1200, 1400, 1600, 1800, 2000, 2200]
        this.raceSchedule = distances.map((distance, index) => ({
          round: index + 1,
          distance,
          horses: this.getRandomHorses(10),
          completed: false,
        }))
      } catch (error) {
        this.error = 'Failed to generate race schedule'
        console.error('Error generating race schedule:', error)
      } finally {
        this.isGenerating = false
      }
    },

    // pick random horses for a race
    getRandomHorses(count: number): Horse[] {
      const shuffled = [...this.horses].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count)
    },

    // start the first race
    async startRace() {
      if (this.isRacing || this.isGenerating) {
        this.error = 'Cannot start race while racing or generating'
        return
      }

      try {
        this.isRacing = true
        this.error = null
        this.currentRace = 0
        this.raceResults = []

        const round = this.raceSchedule[0]
        if (!round) {
          throw new Error('No race rounds available')
        }

        this.resetHorsesForRound(round.horses)
        const results = await this.runRound(round.horses, round.distance)
        this.completeRound(0, results)
      } catch (error) {
        this.error = 'Failed to start race'
        console.error('Error starting race:', error)
      } finally {
        this.isRacing = false
        this.currentRace = null
      }
    },

    // start a specific race
    async startRound(roundIndex: number) {
      if (this.isRacing || this.isGenerating) {
        this.error = 'Cannot start round while racing or generating'
        return
      }

      try {
        this.isRacing = true
        this.error = null
        this.currentRace = roundIndex

        const round = this.raceSchedule[roundIndex]
        if (!round) {
          throw new Error('Invalid round index')
        }

        this.resetHorsesForRound(round.horses)
        const results = await this.runRound(round.horses, round.distance)
        this.completeRound(roundIndex, results)
      } catch (error) {
        this.error = 'Failed to start round'
        console.error('Error starting round:', error)
      } finally {
        this.isRacing = false
        this.currentRace = null
      }
    },

    // reset horses for a new race
    resetHorsesForRound(horses: Horse[]) {
      horses.forEach((horse) => {
        horse.position = 0
        horse.currentSpeed = 0
        horse.finalPosition = null
        horse.finishTime = null
      })
    },

    // run a race and see who wins
    async runRound(horses: Horse[], distance: number): Promise<Horse[]> {
      const results = [...horses]
      const finishLine = distance
      const startTime = Date.now()

      while (results.some((horse) => horse.position < finishLine)) {
        results.forEach((horse) => {
          if (horse.position < finishLine) {
            const baseSpeed = 4
            const conditionFactor = 0.85 + (horse.condition / 100) * 0.3
            const randomFactor = 0.95 + Math.random() * 0.1
            const speed = baseSpeed * conditionFactor * randomFactor
            horse.position = Math.min(finishLine, horse.position + speed)

            if (horse.position >= finishLine && !horse.finishTime) {
              const finishTime = ((Date.now() - startTime) / 1000).toFixed(2)
              horse.finishTime = finishTime
              horse.finalPosition = results.filter(
                (h) => h.finishTime && parseFloat(h.finishTime) <= parseFloat(finishTime),
              ).length
            }
          }
        })

        await new Promise((resolve) => setTimeout(resolve, 40))
      }

      return results.sort((a, b) => {
        if (!a.finishTime) return 1
        if (!b.finishTime) return -1
        return parseFloat(a.finishTime) - parseFloat(b.finishTime)
      })
    },

    // save race results
    completeRound(roundIndex: number, results: Horse[]) {
      this.raceSchedule[roundIndex].completed = true
      this.raceSchedule[roundIndex].horses = [...results].sort((a, b) => {
        if (!a.finishTime) return 1
        if (!b.finishTime) return -1
        return parseFloat(a.finishTime) - parseFloat(b.finishTime)
      })
      this.raceResults.push({
        round: roundIndex + 1,
        distance: this.raceSchedule[roundIndex].distance,
        results,
      })
    },
  },
})
