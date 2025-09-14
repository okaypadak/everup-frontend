<template>
  <div class="ml-4 mt-2">
    <div class="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
      <p class="text-black">{{ comment.content }}</p>
      <div class="flex justify-between items-center mt-2">
        <p class="text-xs text-black">{{ comment.author }} – {{ formatDate(comment.createdAt) }}</p>
        <button
            class="text-xs text-blue-500 hover:underline"
            @click="$emit('replyToggle', comment.id)"
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
          @reply-toggle="$emit('replyToggle', $event)"
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
