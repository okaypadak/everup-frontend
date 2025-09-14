<template>
  <input
    :value="modelValue"
    @input="onInput"
    class="input"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: string | number }>()
const emit = defineEmits(['update:modelValue'])
const onInput = (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)
</script>
