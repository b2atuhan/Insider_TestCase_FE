<script setup lang="ts">
import type { Horse } from '../types/horse'
import Button from 'primevue/button'

defineProps<{
  horses: Horse[]
  showBackButton?: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()
</script>

<template>
  <div class="horses-table">
    <div v-if="title || showBackButton" class="schedule-header">
      <h2 v-if="title" class="gradient-text">{{ title }}</h2>
      <Button
        v-if="showBackButton"
        @click="emit('back')"
        label="Back to Schedule"
        class="p-button-raised p-button-rounded"
        icon="pi pi-arrow-left"
        severity="secondary"
      />
    </div>
    <div class="table-container">
      <table class="race-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Acceleration</th>
            <th>Top Speed</th>
            <th>Condition</th>
            <th>Luck</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="horse in horses" :key="horse.id">
            <td>
              <div class="horse-vest-small" :style="{ backgroundColor: horse.color }">
                <span class="horse-number-small">{{ horse.id }}</span>
              </div>
            </td>
            <td>{{ horse.name }}</td>
            <td>{{ horse.acceleration }}</td>
            <td>{{ horse.topSpeed }}</td>
            <td>{{ horse.condition }}</td>
            <td>{{ horse.luck }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.horses-table {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.race-table th {
  font-weight: bold;
  color: #4f46e5;
  background: #f1f5f9;
}

.race-table tr:hover td {
  background-color: #f8fafc;
}

.horse-vest-small {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.horse-number-small {
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.gradient-text {
  background: linear-gradient(45deg, #ffd700, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 24px;
  font-weight: bold;
}
</style>
