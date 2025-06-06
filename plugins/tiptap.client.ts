import { defineNuxtPlugin } from '#app'
import { EditorContent, Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

export default defineNuxtPlugin(() => {
    return {
        provide: {
            tiptapEditor: Editor,
            tiptapContent: EditorContent,
            tiptapStarter: StarterKit,
        }
    }
})
