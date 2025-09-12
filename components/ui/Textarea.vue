<template>
  <textarea
    :value="modelValue"
    @input="onInput"
    class="w-full px-4 py-2 border rounded bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits(['update:modelValue'])
const onInput = (e: Event) => emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
</script>
