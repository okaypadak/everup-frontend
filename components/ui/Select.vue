<template>
  <select
    :value="modelValue"
    @change="onChange"
    class="w-full px-4 py-2 border rounded bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
    v-bind="$attrs"
  >
    <slot />
  </select>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: string | number }>()
const emit = defineEmits(['update:modelValue'])
const onChange = (e: Event) => emit('update:modelValue', (e.target as HTMLSelectElement).value)
</script>
