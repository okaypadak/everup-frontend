// stores/taskStore.ts
import { defineStore } from 'pinia'

export const useTaskStore = defineStore('task', {
    state: () => ({
        shouldRefresh: false
    }),
    actions: {
        triggerRefresh() {
            this.shouldRefresh = true
        },
        acknowledgeRefresh() {
            this.shouldRefresh = false
        }
    }
})
