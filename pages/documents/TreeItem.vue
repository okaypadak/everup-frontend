<template>
  <li>
    <div class="flex items-center gap-2 py-2 px-2 hover:bg-sky-50 rounded transition">
      <span
          class="font-bold text-gray-800 cursor-pointer flex-1"
          @click="$emit('open', node)"
      >
        📄 {{ node.title || '[Başlık yok]' }}
      </span>
      <span class="text-gray-400 text-xs">{{ node.desc || '[Açıklama yok]' }}</span>

      <button
          class="px-2 py-1 rounded bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 text-xs font-semibold"
          @click.stop="$emit('add-child', node.id)"
      >+ Alt Başlık</button>

      <button
          class="px-2 py-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 text-xs font-semibold"
          @click.stop="$emit('delete', node.id)"
      >X</button>
    </div>

    <ul v-if="node.children?.length" class="pl-6 border-l-2 border-sky-100">
      <TreeItem
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          @open="$emit('open', $event)"
          @add-child="$emit('add-child', $event)"
          @delete="$emit('delete', $event)"
      />
    </ul>
  </li>
</template>

<script setup>
defineProps({ node: Object })
</script>
