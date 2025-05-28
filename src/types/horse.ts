// what a horse looks like, I guess
export interface Horse {
  id: number
  name: string
  color: string
  position: number
  acceleration: number
  topSpeed: number
  condition: number
  luck: number
  currentSpeed: number
  finalPosition: number | null
  finishTime: string | null
  gif: string
}

// one race round
export interface RaceRound {
  round: number
  distance: number
  completed: boolean
  horses: Horse[]
}

// results after a race
export interface RaceResult {
  round: number
  distance: number
  results: Horse[]
}
