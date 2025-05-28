<template>
  <div class="race-track-flex">
    <div class="race-track-outer">
      <div
        class="race-track-container"
        :style="{ width: trackWidth + 'px', height: trackHeight + 'px' }"
      >
        <div
          v-for="marker in distanceMarkers"
          :key="marker.distance"
          class="distance-marker"
          :style="{
            left: marker.left + 'px',
            opacity: isHorseInViewport(marker.distance) ? 1 : 0,
          }"
        >
          <div class="marker-line"></div>
          <span class="marker-text">{{ marker.distance }}m</span>
        </div>

        <img
          v-if="showFinishLine"
          :src="finishLineImg"
          class="finish-line"
          :style="{
            left: raceDistance * SCALE - viewportPosition * SCALE - finishLineWidth / 2 + 65 + 'px',
            opacity: raceDistance * SCALE - viewportPosition * SCALE <= trackWidth ? 1 : 0,
          }"
          alt="Finish Line"
          @error="handleImageError"
        />
        <div v-for="horse in currentHorses" :key="horse.id" class="horse-lane">
          <div
            class="horse"
            :style="{
              left: getHorseLeft(horse.position) + 'px',
              opacity: getHorseOpacity(horse.position),
              backgroundColor: 'transparent',
            }"
          >
            <div class="horse-container">
              <img :src="getHorseGif(horse.gif)" alt="horse" class="horse-gif" />
              <div class="horse-vest" :style="{ backgroundColor: horse.color }">
                <span class="horse-number">{{ horse.id }}</span>
              </div>
            </div>
            <span class="horse-id">{{ horse.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="race-side-panel">
      <div class="table-section">
        <h3>Live Positions</h3>
        <div class="live-positions">
          <div v-for="(horse, index) in sortedHorses" :key="horse.id" class="position-item">
            <span class="position-number">
              {{ horse.finalPosition || index + 1 }}
            </span>
            <div class="horse-info">
              <div class="horse-vest-small" :style="{ backgroundColor: horse.color }">
                <span class="horse-number-small">{{ horse.id }}</span>
              </div>
              <span class="horse-name">{{ horse.name }}</span>
            </div>
            <span class="position-distance">
              {{ horse.finishTime ? horse.finishTime + 's' : Math.floor(horse.position) + 'm' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHorseStore } from '../stores/horseStore'
import { storeToRefs } from 'pinia'
import finishLineImg from '../assets/finishLine.png'

// some numbers we need
const VIEWPORT_SIZE = 1000 // meters
const SCALE = 0.5
const HORSE_SIZE = 80 // px, matches .horse-gif size
const finishLineWidth = 600 // px, must match .finish-line width in CSS

// get stuff from store
const store = useHorseStore()
const { raceSchedule, currentRace } = storeToRefs(store)

// get horses that are racing rn
const currentHorses = computed(() => {
  if (currentRace.value === null || !raceSchedule.value[currentRace.value]) {
    return []
  }
  return raceSchedule.value[currentRace.value].horses
})

// how far they gotta run
const raceDistance = computed(() => {
  if (currentRace.value === null || !raceSchedule.value[currentRace.value]) {
    return 1200 // default if missing
  }
  return raceSchedule.value[currentRace.value].distance
})

// show finish line when race starts
const showFinishLine = computed(() => currentRace.value !== null)

// where to look based on the horse in front
const viewportPosition = computed(() => {
  if (!currentHorses.value.length) return 0
  const leadingHorse = currentHorses.value.reduce((prev, curr) =>
    curr.position > prev.position ? curr : prev,
  )
  const viewportStart = Math.max(0, leadingHorse.position - VIEWPORT_SIZE / 2)
  return Math.min(viewportStart, raceDistance.value - VIEWPORT_SIZE)
})

// how big the track should be
const trackWidth = computed(() => VIEWPORT_SIZE * SCALE + HORSE_SIZE)

const trackHeight = computed(() => {
  // each lane: 50px + 8px margin, plus padding
  return currentHorses.value.length * 58 + 20
})

// make those distance markers
const distanceMarkers = computed(() => {
  if (!raceDistance.value) return []

  const markers = []
  for (let distance = 0; distance <= raceDistance.value; distance += 200) {
    markers.push({
      distance,
      left: (distance - viewportPosition.value) * SCALE,
    })
  }
  return markers
})

// helper functions
function getHorseLeft(position: number) {
  return (position - viewportPosition.value) * SCALE
}

function getHorseGif(filename: string) {
  return new URL(`../assets/Horses/${filename}`, import.meta.url).href
}

function isHorseInViewport(position: number) {
  return position >= viewportPosition.value && position <= viewportPosition.value + VIEWPORT_SIZE
}

// make horses fade out near finish line
function getHorseOpacity(position: number) {
  // if horse is not in viewport, return 0
  if (!isHorseInViewport(position)) return 0

  // how far from finish
  const distanceFromFinish = raceDistance.value - position

  // start fading when close to finish
  if (distanceFromFinish <= 100) {
    return Math.max(0, distanceFromFinish / 100)
  }

  return 1
}

// sort horses: finished ones by time, others by position
const sortedHorses = computed(() => {
  if (!currentHorses.value.length) return []
  const unfinished = currentHorses.value.filter((h) => !h.finishTime)
  const finished = currentHorses.value.filter((h) => h.finishTime)
  const sortedUnfinished = [...unfinished].sort((a, b) => b.position - a.position)
  const sortedFinished = [...finished].sort(
    (a, b) => parseFloat(a.finishTime || '0') - parseFloat(b.finishTime || '0'),
  )
  return [...sortedFinished, ...sortedUnfinished]
})

// oops image didnt load
function handleImageError(e: Event) {
  console.error('Finish line image failed to load:', e)
}
</script>

<style scoped>
.race-track-flex {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  gap: 32px;
  color: #000;
  padding: 20px;
  box-sizing: border-box;
  min-height: 100vh;
  justify-content: center;
}
.race-track-outer {
  flex: 1;
  max-width: 1200px;
  min-width: 600px;
  padding-bottom: 10px;
  display: flex;
  justify-content: center;
}
.race-track-container {
  position: relative;
  background: repeating-linear-gradient(#2e6930 0px, #2e6930 53px, #245626 53px, #245626 106px);
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition:
    width 0.3s,
    height 0.3s;
  width: 100%;
}
.finish-line {
  position: absolute;
  top: 0;
  height: 100%;
  width: 600px;
  z-index: 0;
  transform: rotate(90deg);
  object-fit: contain;
}
.horse-lane {
  position: relative;
  height: 50px;
  margin: 3px 0 0 0;
  border-bottom: 2px solid #ccc;
}
.horse {
  position: absolute;
  width: 50px;
  height: 70px;
  border-radius: 35px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  transition:
    left 0.1s linear,
    opacity 0.2s ease;
  z-index: 3;
  padding-bottom: 24px;
}
.horse-gif {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-right: 6px;
}
.horse-id {
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 1px 1px 2px #fff;
}
.horse-container {
  position: relative;
  display: inline-block;
}
.horse-vest {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 13px;
  height: 13px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.horse-number {
  font-size: 6px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
.race-side-panel {
  min-width: 320px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: sticky;
  top: 20px;
}
.table-section {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 16px;
}
.live-positions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  max-height: 600px;
  overflow-y: auto;
}
.position-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: background-color 0.2s;
}
.position-item:hover {
  background: #f1f3f5;
}
.position-number {
  font-weight: bold;
  font-size: 1.2rem;
}
.position-distance {
  font-weight: 500;
  min-width: 60px;
  text-align: right;
}
.horse-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.horse-vest-small {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.horse-number-small {
  font-size: 10px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
.horse-name {
  font-weight: 500;
}
.distance-marker {
  position: absolute;
  bottom: 0;
  height: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: opacity 0.2s ease;
  z-index: 2;
}
.marker-line {
  width: 2px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.5);
}
.marker-text {
  position: absolute;
  bottom: 0;
  transform: translateY(0);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
}

@media screen and (max-width: 1200px) {
  .race-track-flex {
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }
  .race-track-outer {
    width: 100%;
    min-width: unset;
    max-width: unset;
  }
  .race-track-container {
    width: 100%;
    min-width: unset;
    max-width: unset;
  }
  .race-side-panel {
    width: 100%;
    max-width: unset;
    min-width: unset;
    position: relative;
    top: 0;
  }
}

@media screen and (max-width: 768px) {
  .race-track-flex {
    padding: 10px;
  }

  .race-side-panel {
    max-width: 100%;
  }
}
</style>
