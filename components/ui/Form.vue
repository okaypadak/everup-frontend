<template>
  <form
    class="space-y-4"
    @submit.prevent="onSubmit"
    v-bind="$attrs"
  >
    <slot />
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits(['submit'])
const onSubmit = (e: Event) => emit('submit', e)
</script>
