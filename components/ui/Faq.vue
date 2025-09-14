<template>
  <div>
    <details v-for="(item, index) in items" :key="index" class="faq-item">
      <summary class="faq-question">{{ item.question }}</summary>
      <p class="faq-answer">{{ item.answer }}</p>
    </details>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ items: { question: string; answer: string }[] }>()
</script>
