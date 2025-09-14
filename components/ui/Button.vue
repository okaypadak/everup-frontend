<template>
  <button
    :type="type"
    class="btn"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ type?: string }>(), { type: 'button' })
const { type } = toRefs(props)
</script>
