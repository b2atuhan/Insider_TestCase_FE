import { defineStore } from 'pinia'

const horseGifs = [
  'horse1.gif',
  'horse2.gif',
  'horse3.gif',
  'horse4.gif',
]

const horseNames = [
  'Thunder', 'Blaze', 'Shadow', 'Comet', 'Storm',
  'Rocket', 'Majesty', 'Spirit', 'Lightning', 'Duke',
  'Ranger', 'Phantom', 'Ace', 'Bullet', 'Chief',
  'Dash', 'Hunter', 'Blizzard', 'Jet', 'Flash'
]

export const useHorseStore = defineStore('horse', {
  state: () => ({
    horses: [],
    raceSchedule: [],
    currentRace: null,
    raceResults: [],
    isRacing: false,
    isGenerating: false
  }),

  actions: {
    generateHorses() {
      if (this.isRacing || this.isGenerating) return
      
      this.isGenerating = true
      const colors = [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
        '#00FFFF', '#FFA500', '#800080', '#008000', '#800000',
        '#008080', '#000080', '#FFC0CB', '#A52A2A', '#808080',
        '#FFD700', '#4B0082', '#FF1493', '#00FF7F', '#FF4500'
      ]
      
      this.horses = Array.from({ length: 20 }, (_, index) => ({
        id: index + 1,
        name: horseNames[index],
        color: colors[index],
        acceleration: Math.floor(Math.random() * 100) + 1, // How quickly the horse reaches top speed
        topSpeed: Math.floor(Math.random() * 100) + 1,    // Maximum speed the horse can achieve
        condition: Math.floor(Math.random() * 100) + 1,   // Overall health and fitness
        luck: Math.floor(Math.random() * 100) + 1,        // Random factor that can help or hinder
        position: 0,
        currentSpeed: 0,                                  // Current speed (starts at 0)
        finalPosition: null,
        gif: horseGifs[Math.floor(Math.random() * horseGifs.length)]
      }))
      this.isGenerating = false
    },

    generateRaceSchedule() {
      if (this.isRacing || this.isGenerating) return
      
      this.isGenerating = true
      const distances = [1200, 1400, 1600, 1800, 2000, 2200]
      this.raceSchedule = distances.map((distance, index) => ({
        round: index + 1,
        distance,
        horses: this.getRandomHorses(10),
        completed: false
      }))
      this.isGenerating = false
    },

    getRandomHorses(count) {
      const shuffled = [...this.horses].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count)
    },

    async startRace() {
      if (this.isRacing || this.isGenerating) return
      
      this.isRacing = true
      this.currentRace = 0
      this.raceResults = []

      // Run only the first round
      const round = this.raceSchedule[0]
      
      // Reset horse positions and finish times
      round.horses.forEach(horse => {
        horse.position = 0
        horse.currentSpeed = 0
        horse.finalPosition = null
        horse.finishTime = null
      })

      // Run the race
      const results = await this.runRound(round.horses, round.distance)
      this.completeRound(0, results)
      
      this.isRacing = false
      this.currentRace = null
    },

    async startRound(roundIndex) {
      if (this.isRacing || this.isGenerating) return
      
      this.isRacing = true
      this.currentRace = roundIndex
      
      const round = this.raceSchedule[roundIndex]
      
      // Reset horse positions and finish times
      round.horses.forEach(horse => {
        horse.position = 0
        horse.currentSpeed = 0
        horse.finalPosition = null
        horse.finishTime = null
      })

      // Run the race
      const results = await this.runRound(round.horses, round.distance)
      this.completeRound(roundIndex, results)
      
      this.isRacing = false
      this.currentRace = null
    },

    async runRound(horses, distance) {
      const results = [...horses]
      const finishLine = distance // Track length in px
      const startTime = Date.now()
      
      while (results.some(horse => horse.position < finishLine)) {
        // Update each horse's position
        results.forEach(horse => {
          if (horse.position < finishLine) {
            // Make speed difference more subtle
            const baseSpeed = 4;
            const conditionFactor = 0.85 + (horse.condition / 100) * 0.3; // range: 0.85-1.15
            const randomFactor = 0.95 + Math.random() * 0.1; // range: 0.95-1.05
            const speed = baseSpeed * conditionFactor * randomFactor;
            horse.position = Math.min(finishLine, horse.position + speed)
            
            // Record finish time when horse crosses the line
            if (horse.position >= finishLine && !horse.finishTime) {
              horse.finishTime = ((Date.now() - startTime) / 1000).toFixed(2)
              horse.finalPosition = results.filter(h => h.finishTime && parseFloat(h.finishTime) <= parseFloat(horse.finishTime)).length
            }
          }
        })
        
        // Slower animation
        await new Promise(resolve => setTimeout(resolve, 40))
      }

      // Sort horses by their finish time
      return results.sort((a, b) => {
        if (!a.finishTime) return 1
        if (!b.finishTime) return -1
        return parseFloat(a.finishTime) - parseFloat(b.finishTime)
      })
    },

    async completeRound(roundIndex, results) {
      this.raceSchedule[roundIndex].completed = true
      // Sort horses by finish time before storing results
      this.raceSchedule[roundIndex].horses = [...results].sort((a, b) => {
        if (!a.finishTime) return 1
        if (!b.finishTime) return -1
        return parseFloat(a.finishTime) - parseFloat(b.finishTime)
      })
      this.raceResults.push({
        round: roundIndex + 1,
        distance: this.raceSchedule[roundIndex].distance,
        results
      })
    }
  }
}) 