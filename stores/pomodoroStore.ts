// stores/pomodoroStore.ts
import { defineStore } from 'pinia'

export type PomodoroPhase = 'focus' | 'break'

export interface PomodoroSession {
    id: string
    startedAt: string
    completedAt: string
    focusDuration: number
    breakDuration: number
    projectId: number | null
    projectName: string | null
    taskId: number | null
}

interface PomodoroSettings {
    workDuration: number
    breakDuration: number
    linkedProjectId: number | null
    linkedProjectName: string | null
    linkedTaskId: number | null
}

const SESSION_STORAGE_KEY = 'everup:pomodoro:sessions'
const SETTINGS_STORAGE_KEY = 'everup:pomodoro:settings'

export const usePomodoroStore = defineStore('pomodoro', {
    state: () => ({
        workDuration: 25,
        breakDuration: 5,
        currentPhase: 'focus' as PomodoroPhase,
        remainingSeconds: 25 * 60,
        isActive: false,
        completedSessions: 0,
        sessionHistory: [] as PomodoroSession[],
        timerId: null as ReturnType<typeof setInterval> | null,
        cycleStartedAt: null as string | null,
        linkedProjectId: null as number | null,
        linkedProjectName: null as string | null,
        linkedTaskId: null as number | null
    }),
    actions: {
        initializeFromStorage() {
            if (!process.client) {
                return
            }

            const storedSessions = window.localStorage.getItem(SESSION_STORAGE_KEY)
            if (storedSessions) {
                try {
                    const parsed: PomodoroSession[] = JSON.parse(storedSessions)
                    this.sessionHistory = parsed
                    this.completedSessions = parsed.length
                } catch (error) {
                    console.warn('Pomodoro oturumları yüklenirken hata oluştu:', error)
                }
            }

            const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
            if (storedSettings) {
                try {
                    const parsed: PomodoroSettings = JSON.parse(storedSettings)
                    this.workDuration = parsed.workDuration
                    this.breakDuration = parsed.breakDuration
                    this.linkedProjectId = parsed.linkedProjectId
                    this.linkedProjectName = parsed.linkedProjectName
                    this.linkedTaskId = parsed.linkedTaskId
                    if (this.currentPhase === 'focus') {
                        this.remainingSeconds = this.workDuration * 60
                    } else {
                        this.remainingSeconds = this.breakDuration * 60
                    }
                } catch (error) {
                    console.warn('Pomodoro ayarları yüklenirken hata oluştu:', error)
                }
            }
        },
        setWorkDuration(minutes: number) {
            const sanitized = Math.max(1, Math.round(minutes))
            this.workDuration = sanitized
            if (this.currentPhase === 'focus' && !this.isActive) {
                this.remainingSeconds = sanitized * 60
            }
            this.persistSettings()
        },
        setBreakDuration(minutes: number) {
            const sanitized = Math.max(1, Math.round(minutes))
            this.breakDuration = sanitized
            if (this.currentPhase === 'break' && !this.isActive) {
                this.remainingSeconds = sanitized * 60
            }
            this.persistSettings()
        },
        linkProject(projectId: number | null, projectName: string | null) {
            this.linkedProjectId = projectId
            this.linkedProjectName = projectName
            this.persistSettings()
        },
        linkTask(taskId: number | null) {
            this.linkedTaskId = taskId
            this.persistSettings()
        },
        startTimer() {
            if (this.isActive || !process.client) {
                return
            }

            if (!this.cycleStartedAt) {
                this.cycleStartedAt = new Date().toISOString()
            }

            this.isActive = true
            this.timerId = setInterval(() => {
                this.tick()
            }, 1000)
        },
        pauseTimer() {
            this.isActive = false
            this.clearTimerInterval()
        },
        resetTimer() {
            this.pauseTimer()
            this.currentPhase = 'focus'
            this.remainingSeconds = this.workDuration * 60
            this.cycleStartedAt = null
        },
        tick() {
            if (!this.isActive) {
                return
            }

            if (this.remainingSeconds > 0) {
                this.remainingSeconds -= 1
                return
            }

            this.completePhase()
        },
        completePhase() {
            this.togglePhase(false)
        },
        togglePhase(manual = false) {
            if (this.currentPhase === 'focus') {
                if (!manual) {
                    this.completedSessions += 1
                    this.recordSession()
                }
                this.cycleStartedAt = null
                this.currentPhase = 'break'
                this.remainingSeconds = this.breakDuration * 60
                if (manual) {
                    this.pauseTimer()
                }
            } else {
                this.currentPhase = 'focus'
                this.remainingSeconds = this.workDuration * 60
                if (manual) {
                    this.pauseTimer()
                    this.cycleStartedAt = null
                } else if (this.isActive) {
                    this.cycleStartedAt = new Date().toISOString()
                } else {
                    this.cycleStartedAt = null
                }
            }
        },
        recordSession() {
            const completedAt = new Date().toISOString()
            const startedAt = this.cycleStartedAt || completedAt
            const session: PomodoroSession = {
                id: completedAt,
                startedAt,
                completedAt,
                focusDuration: this.workDuration,
                breakDuration: this.breakDuration,
                projectId: this.linkedProjectId,
                projectName: this.linkedProjectName,
                taskId: this.linkedTaskId
            }
            this.sessionHistory = [session, ...this.sessionHistory]
            this.persistSessions()
        },
        clearTimerInterval() {
            if (this.timerId) {
                clearInterval(this.timerId)
                this.timerId = null
            }
        },
        persistSessions() {
            if (!process.client) {
                return
            }

            try {
                window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.sessionHistory))
            } catch (error) {
                console.warn('Pomodoro oturumları kaydedilirken hata oluştu:', error)
            }
        },
        persistSettings() {
            if (!process.client) {
                return
            }

            const settings: PomodoroSettings = {
                workDuration: this.workDuration,
                breakDuration: this.breakDuration,
                linkedProjectId: this.linkedProjectId,
                linkedProjectName: this.linkedProjectName,
                linkedTaskId: this.linkedTaskId
            }

            try {
                window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
            } catch (error) {
                console.warn('Pomodoro ayarları kaydedilirken hata oluştu:', error)
            }
        }
    }
})
