<script setup lang="ts">
import { useHorseStore } from './stores/horseStore'
import Button from 'primevue/button'
import { storeToRefs } from 'pinia'
import RaceTrack from '@/components/RaceTrack.vue'
import { ref } from 'vue'
import HorseTable from './components/HorseTable.vue'
import type { RaceRound } from './types/horse'

const store = useHorseStore()
const { horses, raceSchedule, isRacing, isGenerating } = storeToRefs(store)
const showHorses = ref(false)
const selectedRound = ref<RaceRound | null>(null)
const showResults = ref(false)

const generateHorses = () => {
  store.generateHorses()
}

const generateSchedule = () => {
  store.generateRaceSchedule()
}

const startRound = (roundIndex: number) => {
  store.startRound(roundIndex)
}

const getNextRoundIndex = () => {
  return raceSchedule.value.findIndex((round) => !round.completed)
}

const showRaceResults = (round: RaceRound) => {
  selectedRound.value = round
  showResults.value = true
}

const backToSchedule = () => {
  showResults.value = false
  selectedRound.value = null
}
</script>

<template>
  <div class="bg-container"></div>
  <div class="app-container">
    <header class="header">
      <h1>🏇 Horse Racing Game</h1>
    </header>

    <main class="main-content">
      <div v-if="!showResults">
        <div class="control-panel">
          <Button
            v-if="!horses.length"
            @click="generateHorses"
            label="Generate Horses"
            class="p-button-raised p-button-rounded"
            icon="pi pi-plus"
            severity="primary"
            :loading="isGenerating"
            :disabled="isRacing || isGenerating"
          />
        </div>

        <div v-if="horses.length && !raceSchedule.length" class="horses-table">
          <HorseTable :horses="horses" title="Generated Horses" />
          <div class="schedule-button">
            <Button
              @click="generateSchedule"
              label="Generate Schedule"
              class="p-button-raised p-button-rounded"
              icon="pi pi-calendar"
              severity="success"
              :loading="isGenerating"
              :disabled="!horses?.length || isRacing || isGenerating"
            />
          </div>
        </div>

        <div v-if="showHorses && raceSchedule.length" class="horses-table">
          <HorseTable
            :horses="horses"
            :showBackButton="true"
            title="Horse Details"
            @back="showHorses = false"
          />
        </div>

        <div v-if="raceSchedule.length && !isRacing && !showHorses" class="schedule-table">
          <div class="schedule-header">
            <h2 class="gradient-text">Race Schedule</h2>
            <Button
              @click="showHorses = true"
              label="Lookup Horses"
              class="p-button-raised p-button-rounded"
              icon="pi pi-search"
              severity="info"
            />
          </div>
          <div class="table-container">
            <table class="race-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Distance</th>
                  <th>Horses</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="round in raceSchedule" :key="round.round">
                  <td>{{ round.round }}</td>
                  <td>{{ round.distance }}m</td>
                  <td>
                    <div class="horse-list">
                      <div
                        v-for="horse in round.horses"
                        :key="horse.id"
                        class="horse-vest-small"
                        :style="{ backgroundColor: horse.color }"
                      >
                        <span class="horse-number-small">{{ horse.id }}</span>
                        <span v-if="round.completed && horse.finishTime" class="finish-time"
                          >{{ horse.finishTime }}s</span
                        >
                      </div>
                    </div>
                  </td>
                  <td>
                    <Button
                      v-if="round.completed"
                      @click="showRaceResults(round)"
                      label="View Results"
                      class="p-button-raised p-button-rounded"
                      icon="pi pi-chart-bar"
                      severity="info"
                    />
                    <span v-else class="status-badge pending">Pending</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="schedule-button">
            <Button
              v-if="!raceSchedule.every((round) => round.completed)"
              @click="startRound(getNextRoundIndex())"
              :label="'Start Round ' + (getNextRoundIndex() + 1)"
              class="p-button-raised p-button-rounded"
              icon="pi pi-play"
              severity="warning"
              :loading="isRacing"
              :disabled="isRacing || isGenerating"
            />
          </div>
        </div>

        <div v-if="isRacing" class="race-track">
          <RaceTrack />
        </div>
      </div>

      <div v-else class="results-container">
        <div class="results-header">
          <Button
            @click="backToSchedule"
            label="Back to Schedule"
            class="p-button-raised p-button-rounded"
            icon="pi pi-arrow-left"
            severity="secondary"
          />
          <h2 class="gradient-text">Race Results - Round {{ selectedRound?.round }}</h2>
        </div>

        <div class="results-content">
          <div class="results-table">
            <table class="race-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Horse</th>
                  <th>Finish Time</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(horse, index) in selectedRound?.horses.sort((a, b) => {
                    const timeA = a.finishTime ? parseFloat(a.finishTime) : Infinity
                    const timeB = b.finishTime ? parseFloat(b.finishTime) : Infinity
                    return timeA - timeB
                  })"
                  :key="horse.id"
                >
                  <td>{{ index + 1 }}</td>
                  <td>
                    <div class="horse-info">
                      <div class="horse-vest-small" :style="{ backgroundColor: horse.color }">
                        <span class="horse-number-small">{{ horse.id }}</span>
                      </div>
                      <span class="horse-name">{{ horse.name }}</span>
                    </div>
                  </td>
                  <td>{{ horse.finishTime || 'DNF' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.bg-container {
  min-height: 100vh;
  width: 100vw;
  background: #f8f9fa;
  position: fixed;
  top: 0;
  left: 0;
  overflow-x: auto;
  z-index: -1;
  pointer-events: none;
  inset: 0;
}

.app-container {
  min-width: 90vw;
  min-height: 10vh;
  position: relative;
  z-index: 0;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 25px 40px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #4f46e5 100%);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.3);
  width: 100%;
  max-width: 1000px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 1;
}

.header:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(79, 70, 229, 0.4);
}

.header h1 {
  color: white;
  margin: 0;
  font-size: 2.8rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  font-weight: 800;
  letter-spacing: -0.5px;
  position: relative;
  z-index: 2;
  background: linear-gradient(to right, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.main-content {
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.control-panel {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
}

.horses-table,
.schedule-table {
  background-color: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  transition: all 0.3s ease;
}

.horses-table:hover,
.schedule-table:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f1f5f9;
}

.table-container {
  overflow-x: auto;
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
}

.race-table {
  width: 100%;
  border-collapse: collapse;
  color: #1e293b;
}

.race-table th,
.race-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.race-table th {
  font-weight: bold;
  color: #4f46e5;
  background: #f1f5f9;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.race-table tr:hover td {
  background-color: #f8fafc;
}

.horse-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px;
  min-height: 60px;
  align-items: center;
}

.horse-vest-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.horse-vest-small:hover {
  transform: scale(1.1);
}

.horse-number-small {
  color: white;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.finish-time {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: #475569;
  white-space: nowrap;
  background: white;
  padding: 2px 4px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.gradient-text {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  font-weight: 700;
  animation: shimmer 3s infinite;
  background-size: 200% auto;
}

.results-container {
  background-color: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  transition: all 0.3s ease;
}

.results-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f1f5f9;
}

.results-header h2 {
  margin: 0;
  font-size: 2rem;
}

.results-content {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
}

.results-table {
  width: 100%;
  overflow-x: auto;
}

.horse-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.horse-name {
  font-weight: 500;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-block;
  min-width: 100px;
  text-align: center;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.schedule-button {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}

.race-track {
  width: 100%;
  margin-top: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

:deep(.p-button) {
  transition: all 0.3s ease;
  padding: 10px 20px;
  border-radius: 10px;
}

:deep(.p-button.p-button-primary) {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
}

:deep(.p-button.p-button-success) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
}

:deep(.p-button.p-button-warning) {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
}

:deep(.p-button.p-button-info) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
}

:deep(.p-button.p-button-secondary) {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
}

:deep(.p-button:not(:disabled):hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  filter: brightness(1.1);
}

:deep(.p-button:not(:disabled):active) {
  transform: translateY(0);
}
</style>
