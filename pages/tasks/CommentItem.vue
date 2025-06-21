<template>
  <div class="ml-4 mt-2">
    <div class="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
      <p class="text-gray-800">{{ comment.content }}</p>
      <div class="flex justify-between items-center mt-2">
        <p class="text-xs text-gray-500">{{ comment.author }} – {{ formatDate(comment.createdAt) }}</p>
        <button
            @click="$emit('replyToggle', comment.id)"
            class="text-xs text-blue-500 hover:underline"
        >
          Cevapla
        </button>
      </div>
    </div>

    <div v-if="comment.children?.length" class="mt-2 space-y-2">
      <CommentItem
          v-for="child in comment.children"
          :key="child.id"
          :comment="child"
          @replyToggle="$emit('replyToggle', $event)"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ comment: Object })
defineEmits(['replyToggle'])

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('tr-TR')
}
</script>
