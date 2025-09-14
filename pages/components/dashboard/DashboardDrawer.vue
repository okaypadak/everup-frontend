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
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import NotificationsPanel from './notifications.vue'
import TaskCreatePanel from './taskCreate.vue'

const props = defineProps<{
  type: 'notifications' | 'taskCreate'
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

