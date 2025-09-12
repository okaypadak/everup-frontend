<template>
  <button
    :type="type"
    class="px-4 py-2 font-medium bg-primary text-white rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ type?: string }>(), { type: 'button' })
const { type } = toRefs(props)
</script>
