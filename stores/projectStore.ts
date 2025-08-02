// stores/projectStore.ts
import { defineStore } from 'pinia'

export const useProjectStore = defineStore('project', {
    state: () => ({
        selectedProjectId: null as number | null,
        selectedProjectName: null as string | null,
        projectLabels: [] as TaskLabel[]
    }),
    actions: {
        setLabels(labels: TaskLabel[]) {
            this.projectLabels = labels
        },
        setProject(id: number, name: string) {
            this.selectedProjectId = id
            this.selectedProjectName = name
        },
        clearProject() {
            this.selectedProjectId = null
            this.selectedProjectName = null
        }
    }
})
