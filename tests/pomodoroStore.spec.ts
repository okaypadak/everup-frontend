import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import { createPinia, setActivePinia } from 'pinia'

import { usePomodoroStore } from '../stores/pomodoroStore'

describe('pomodoro store project totals', () => {
  const storage = new Map<string, string>()

  beforeEach(() => {
    setActivePinia(createPinia())
    ;(process as any).client = true
    storage.clear()
    const localStorage = {
      getItem: (key: string) => (storage.has(key) ? storage.get(key)! : null),
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
      removeItem: (key: string) => {
        storage.delete(key)
      },
      clear: () => {
        storage.clear()
      }
    }
    globalThis.window = { localStorage } as any
  })

  it('creates and updates totals when project link changes', () => {
    const store = usePomodoroStore()
    store.linkProject(1, 'Öncelikli Proje')

    assert.deepStrictEqual(store.projectTotals['1'], {
      projectId: 1,
      projectName: 'Öncelikli Proje',
      totalFocusMinutes: 0
    })

    store.linkProject(1, 'Güncel Proje Adı')

    assert.deepStrictEqual(store.projectTotals['1'], {
      projectId: 1,
      projectName: 'Güncel Proje Adı',
      totalFocusMinutes: 0
    })
  })

  it('accumulates focus minutes per project when sessions are recorded', () => {
    const store = usePomodoroStore()
    store.linkProject(42, 'Analiz Projesi')

    store.recordSession()
    store.recordSession()

    assert.deepStrictEqual(store.projectTotals['42'], {
      projectId: 42,
      projectName: 'Analiz Projesi',
      totalFocusMinutes: store.workDuration * 2
    })
  })

  it('does not change project totals when project link is cleared', () => {
    const store = usePomodoroStore()
    store.linkProject(5, 'Temizlenecek Proje')
    store.recordSession()

    store.linkProject(null, null)
    store.recordSession()

    assert.strictEqual(store.projectTotals['5'].totalFocusMinutes, store.workDuration)
    assert.strictEqual(store.projectTotals['5'].projectName, 'Temizlenecek Proje')
  })
})
