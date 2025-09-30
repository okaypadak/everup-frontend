<template>
  <transition name="slide">
    <div v-if="true" class="fixed inset-0 bg-white z-50 md:hidden overflow-y-auto">
      <div class="p-4">
        <button class="mb-4 text-black" @click="$emit('close')">
          Kapat
        </button>
        <NotificationsPanel
          v-if="type === 'notifications'"
          :notifications="notifications"
        />
        <TaskCreatePanel v-else-if="type === 'taskCreate'" />
        <PomodoroTimer v-else-if="type === 'pomodoro'" />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import NotificationsPanel from './notifications.vue'
import TaskCreatePanel from './taskCreate.vue'
import PomodoroTimer from './pomodoroTimer.vue'

const props = defineProps<{
  type: 'notifications' | 'taskCreate' | 'pomodoro'
  notifications?: any[]
}>()

defineEmits(['close'])
</script>

<style scoped>
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}
</style>

