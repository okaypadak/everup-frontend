<template>
  <ClientOnly>
    <div>
      <!-- Toolbar -->
      <div v-if="editor" class="flex flex-wrap gap-2 mb-4">
        <button
            class="px-2 py-1 border rounded text-sm"
            :class="{ 'bg-black text-white': editor.isActive('bold') }"
            @click="editor.chain().focus().toggleBold().run()"
        >B</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            :class="{ 'bg-black text-white': editor.isActive('italic') }"
            @click="editor.chain().focus().toggleItalic().run()"
        >I</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            :class="{ 'bg-black text-white': editor.isActive('underline') }"
            @click="editor.chain().focus().toggleUnderline().run()"
        ><u>U</u></button>
        <button
            class="px-2 py-1 border rounded text-sm"
            :class="{ 'bg-black text-white': editor.isActive('strike') }"
            @click="editor.chain().focus().toggleStrike().run()"
        ><s>S</s></button>
        <button
            class="px-2 py-1 border rounded text-sm"
            :class="{ 'bg-black text-white': editor.isActive('heading', { level: 2 }) }"
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >H2</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            :class="{ 'bg-black text-white': editor.isActive('code') }"
            @click="editor.chain().focus().toggleCode().run()"
        >&lt;/&gt;</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            :class="{ 'bg-black text-white': editor.isActive('bulletList') }"
            @click="editor.chain().focus().toggleBulletList().run()"
        >• Liste</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            :class="{ 'bg-black text-white': editor.isActive('orderedList') }"
            @click="editor.chain().focus().toggleOrderedList().run()"
        >1. Liste</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            :class="{ 'bg-black text-white': editor.isActive('blockquote') }"
            @click="editor.chain().focus().toggleBlockquote().run()"
        >“ ”</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            @click="editor.chain().focus().undo().run()"
        >Undo</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            @click="editor.chain().focus().redo().run()"
        >Redo</button>
      </div>

      <!-- Editor -->
      <component :is="EditorContent" :editor="editor" />
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Blockquote from '@tiptap/extension-blockquote'
import Code from '@tiptap/extension-code'
const props = defineProps({
  initialContent: { type: String, default: '' }
})

// Nuxt için aşağıdaki kullanılır:
const { $tiptapEditor, $tiptapContent } = useNuxtApp()

const EditorContent = $tiptapContent
const editor = ref(null)

onMounted(() => {
  editor.value = new $tiptapEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      BulletList,
      OrderedList,
      Blockquote,
      Code
    ],
    content: props.initialContent || '<p></p>',
  })
})

// Prop değişince içerik güncelle
watch(
    () => props.initialContent,
    (val) => {
      if (editor.value && val !== editor.value.getHTML()) {
        editor.value.commands.setContent(val || '<p></p>', false)
      }
    }
)

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
button {
  transition: 0.2s ease;
}

:deep(.ProseMirror) {
  min-height: 500px;
  max-height: 1200px;
  padding: 2rem;
  background-color: #f9fafb; /* hafif gri */
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  line-height: 1.7;
  font-family: 'Segoe UI', 'Calibri', 'Arial', sans-serif;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
  outline: none;
}
</style>
