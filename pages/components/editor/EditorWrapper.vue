<template>
  <ClientOnly>
    <div>
      <!-- Toolbar -->
      <div class="flex flex-wrap gap-2 mb-4" v-if="editor">
        <button
            class="px-2 py-1 border rounded text-sm"
            @click="editor.chain().focus().toggleBold().run()"
            :class="{ 'bg-black text-white': editor.isActive('bold') }"
        >B</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'bg-black text-white': editor.isActive('italic') }"
        >I</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            @click="editor.chain().focus().toggleUnderline().run()"
            :class="{ 'bg-black text-white': editor.isActive('underline') }"
        ><u>U</u></button>
        <button
            class="px-2 py-1 border rounded text-sm"
            @click="editor.chain().focus().toggleStrike().run()"
            :class="{ 'bg-black text-white': editor.isActive('strike') }"
        ><s>S</s></button>
        <button
            class="px-2 py-1 border rounded text-sm"
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="{ 'bg-black text-white': editor.isActive('heading', { level: 2 }) }"
        >H2</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            @click="editor.chain().focus().toggleCode().run()"
            :class="{ 'bg-black text-white': editor.isActive('code') }"
        >&lt;/&gt;</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'bg-black text-white': editor.isActive('bulletList') }"
        >• Liste</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'bg-black text-white': editor.isActive('orderedList') }"
        >1. Liste</button>
        <button
            class="px-2 py-1 border rounded text-sm"
            @click="editor.chain().focus().toggleBlockquote().run()"
            :class="{ 'bg-black text-white': editor.isActive('blockquote') }"
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
const props = defineProps({
  initialContent: { type: String, default: '' }
})

// Nuxt için aşağıdaki kullanılır:
const { $tiptapEditor, $tiptapContent } = useNuxtApp()
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Blockquote from '@tiptap/extension-blockquote'
import Code from '@tiptap/extension-code'

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
.ProseMirror {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}
</style>
