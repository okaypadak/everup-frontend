import { defineEventHandler, getCookie, getRouterParam } from 'h3'
import { ofetch } from 'ofetch'

type Task = {
  id: number
  title?: string
  createdAt?: string
  completedAt?: string | null
  updatedAt?: string
  deadline?: string | null
  status?: string
  assignee?: { id?: number; name?: string }
}

type TaskDetail = Task & {
  description?: string
  completedAt?: string | null
  closedAt?: string | null
  finishedAt?: string | null
  resolvedAt?: string | null
  comments?: Comment[]
}

type Document = {
  id: number
  title?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
  author?: { name?: string }
}

type Meeting = {
  id: number
  title?: string
  agenda?: string
  description?: string
  scheduledAt?: string
  scheduled_at?: string
  startTime?: string
  start_time?: string
  endTime?: string
  end_time?: string
  finishedAt?: string
  finished_at?: string
}

type Sprint = {
  id: number
  name?: string
  goal?: string | null
  startDate?: string
  start_date?: string
  endDate?: string
  end_date?: string
  completedAt?: string | null
  completed_at?: string | null
}

type Comment = {
  id: number
  content?: string
  createdAt?: string
  created_at?: string
  author?: string
  authorName?: string
  taskId?: number
}

type TimelineEvent = {
  id: string
  category: 'task' | 'document' | 'meeting' | 'comment' | 'sprint'
  eventType: string
  title: string
  description?: string
  date: string
  link?: string
  meta?: Record<string, any>
}

type TimelineStats = {
  tasksCreated: number
  tasksCompleted: number
  documentsAdded: number
  meetingsHeld: number
  commentsAdded: number
  sprintsStarted: number
  sprintsCompleted: number
}

function normalizeDate(...candidates: Array<string | null | undefined>): string | null {
  for (const value of candidates) {
    if (!value) continue
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString()
    }
  }
  return null
}

function ensureArray<T>(input: any): T[] {
  if (Array.isArray(input)) return input as T[]
  if (input && Array.isArray(input.data)) return input.data as T[]
  return []
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  const projectIdParam = getRouterParam(event, 'id')

  if (!token) {
    return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
  }

  const projectId = Number(projectIdParam)
  if (!projectId || Number.isNaN(projectId)) {
    return { statusCode: 400, message: 'Geçersiz proje ID' }
  }

  const { apiBaseUrl } = useRuntimeConfig()
  const authHeaders = { Authorization: `Bearer ${token}` }

  async function fetchSafe<T>(url: string): Promise<T[]> {
    try {
      const response = await ofetch(url, {
        method: 'GET',
        headers: authHeaders,
      })
      return ensureArray<T>(response)
    } catch (error) {
      console.error(`[timeline] ${url} isteği başarısız oldu:`, error)
      return []
    }
  }

  async function fetchVelocityHistory(limit = 12): Promise<any[]> {
    try {
      const url = `${apiBaseUrl}/sprints/velocity/${projectId}/${limit}/count`
      const response = await ofetch(url, {
        method: 'GET',
        headers: authHeaders,
      })
      return ensureArray<any>(response)
    } catch (error) {
      console.warn('[timeline] sprint velocity verisi alınamadı:', error)
      return []
    }
  }

  const [tasksRaw, documents, meetings, sprints, velocityHistory] = await Promise.all([
    fetchSafe<Task>(`${apiBaseUrl}/tasks/project/${projectId}`),
    fetchSafe<Document>(`${apiBaseUrl}/documents/project/${projectId}`),
    fetchSafe<Meeting>(`${apiBaseUrl}/projects/${projectId}/meetings`),
    fetchSafe<Sprint>(`${apiBaseUrl}/projects/${projectId}/sprints`),
    fetchVelocityHistory(),
  ])

  const events: TimelineEvent[] = []
  const stats: TimelineStats = {
    tasksCreated: 0,
    tasksCompleted: 0,
    documentsAdded: 0,
    meetingsHeld: 0,
    commentsAdded: 0,
    sprintsStarted: 0,
    sprintsCompleted: 0,
  }

  for (const task of tasksRaw) {
    const createdAt = normalizeDate(task.createdAt)
    if (createdAt) {
      events.push({
        id: `task-${task.id}-created`,
        category: 'task',
        eventType: 'created',
        title: `Görev oluşturuldu: ${task.title ?? 'Görev #' + task.id}`,
        description: task.assignee?.name ? `Atanan: ${task.assignee.name}` : undefined,
        date: createdAt,
        link: `/tasks/${task.id}`,
        meta: { taskId: task.id, deadline: task.deadline },
      })
      stats.tasksCreated += 1
    }
  }

  const taskDetails = await Promise.all(
    tasksRaw.map(async (task) => {
      try {
        const detail = await ofetch<TaskDetail>(`${apiBaseUrl}/tasks/detail/${task.id}`, {
          method: 'GET',
          headers: authHeaders,
        })
        return detail
      } catch (error) {
        console.warn(`[timeline] Görev detayı alınamadı (ID: ${task.id})`, error)
        return null
      }
    })
  )

  for (const detail of taskDetails) {
    if (!detail) continue

    const completionDate = normalizeDate(
      detail.completedAt,
      detail.completed_at,
      detail.finishedAt,
      detail.finished_at,
      detail.closedAt,
      detail.resolvedAt,
      detail.updatedAt,
    )

    if (completionDate) {
      events.push({
        id: `task-${detail.id}-completed`,
        category: 'task',
        eventType: 'completed',
        title: `Görev tamamlandı: ${detail.title ?? 'Görev #' + detail.id}`,
        description: detail.goal ? detail.goal : undefined,
        date: completionDate,
        link: `/tasks/${detail.id}`,
        meta: { taskId: detail.id },
      })
      stats.tasksCompleted += 1
    }

    const comments = ensureArray<Comment>(detail.comments)
    for (const comment of comments) {
      const commentDate = normalizeDate(comment.createdAt, comment.created_at)
      if (!commentDate) continue

      events.push({
        id: `comment-${detail.id}-${comment.id}`,
        category: 'comment',
        eventType: 'commented',
        title: `${comment.author ?? comment.authorName ?? 'Bir kullanıcı'} yorum yaptı`,
        description: comment.content ?? 'Yorum eklendi.',
        date: commentDate,
        link: `/tasks/${detail.id}`,
        meta: { taskId: detail.id, commentId: comment.id },
      })
      stats.commentsAdded += 1
    }
  }

  for (const document of documents) {
    const createdDate = normalizeDate(document.createdAt, document.created_at, document.updatedAt, document.updated_at)
    if (!createdDate) continue

    events.push({
      id: `document-${document.id}-created`,
      category: 'document',
      eventType: 'created',
      title: `Döküman eklendi: ${document.title ?? 'Döküman #' + document.id}`,
      description: document.author?.name ? `Oluşturan: ${document.author.name}` : undefined,
      date: createdDate,
      link: `/documents/writer/${document.id}`,
      meta: { documentId: document.id },
    })
    stats.documentsAdded += 1
  }

  for (const meeting of meetings) {
    const startDate = normalizeDate(meeting.scheduledAt, meeting.scheduled_at, meeting.startTime, meeting.start_time)
    const endDate = normalizeDate(meeting.endTime, meeting.end_time, meeting.finishedAt, meeting.finished_at)

    if (startDate) {
      events.push({
        id: `meeting-${meeting.id}-scheduled`,
        category: 'meeting',
        eventType: 'scheduled',
        title: `Toplantı planlandı: ${meeting.title ?? 'Toplantı #' + meeting.id}`,
        description: meeting.agenda ?? meeting.description ?? undefined,
        date: startDate,
        meta: { meetingId: meeting.id },
      })
      stats.meetingsHeld += 1
    }

    if (endDate) {
      events.push({
        id: `meeting-${meeting.id}-ended`,
        category: 'meeting',
        eventType: 'completed',
        title: `Toplantı tamamlandı: ${meeting.title ?? 'Toplantı #' + meeting.id}`,
        description: meeting.agenda ?? meeting.description ?? undefined,
        date: endDate,
        meta: { meetingId: meeting.id },
      })
    }
  }

  for (const sprint of sprints) {
    const startDate = normalizeDate(sprint.startDate, sprint.start_date)
    const endDate = normalizeDate(sprint.endDate, sprint.end_date, sprint.completedAt, sprint.completed_at)

    if (startDate) {
      events.push({
        id: `sprint-${sprint.id}-started`,
        category: 'sprint',
        eventType: 'started',
        title: `Sprint başladı: ${sprint.name ?? 'Sprint #' + sprint.id}`,
        description: sprint.goal ?? undefined,
        date: startDate,
        meta: { sprintId: sprint.id },
      })
      stats.sprintsStarted += 1
    }

    if (endDate) {
      events.push({
        id: `sprint-${sprint.id}-completed`,
        category: 'sprint',
        eventType: 'completed',
        title: `Sprint tamamlandı: ${sprint.name ?? 'Sprint #' + sprint.id}`,
        description: sprint.goal ?? undefined,
        date: endDate,
        meta: { sprintId: sprint.id },
      })
      stats.sprintsCompleted += 1
    }
  }

  const existingEventIds = new Set(events.map(event => event.id))

  velocityHistory.forEach((entry, index) => {
    const sprintId = entry?.sprintId ?? entry?.id ?? entry?.sprint_id ?? entry?.sprintName ?? `velocity-${index}`
    const completionDate = normalizeDate(
      entry?.completedAt,
      entry?.completed_at,
      entry?.endDate,
      entry?.end_date,
      entry?.date,
    )

    if (!completionDate) return

    const eventId = `sprint-${sprintId}-completed`
    if (existingEventIds.has(eventId)) return

    events.push({
      id: eventId,
      category: 'sprint',
      eventType: 'completed',
      title: `Sprint tamamlandı: ${entry?.sprintName ?? 'Sprint'}`,
      description: typeof entry?.value === 'number' ? `Tamamlanan görev: ${entry.value}` : undefined,
      date: completionDate,
      meta: { sprintId, velocityValue: entry?.value },
    })
    existingEventIds.add(eventId)
    stats.sprintsCompleted += 1
  })

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return { events, stats }
})
