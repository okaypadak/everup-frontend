<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="max-w-5xl mx-auto px-4 py-10">
      <div class="bg-white p-8 rounded-2xl shadow-lg space-y-10 border border-gray-100" v-if="task">
        <!-- Başlık -->
        <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-sky-700">{{ task.title }}</h1>
            <p class="text-sm text-gray-500">Oluşturulma Tarihi: {{ formatDate(task.createdAt) }}</p>
            <p class="text-xs text-gray-400 italic">{{ formatDurationSince(task.createdAt) }}</p>
            <p v-if="task.status === 'Ready'" class="mt-1 text-xs text-green-600 font-medium">Başlamaya hazır ✅</p>
          </div>

          <div class="flex gap-2 flex-wrap mt-2 sm:mt-0">
            <button
                v-for="statusOption in statusOptions"
                :key="statusOption.value"
                @click="updateStatus(statusOption.value)"
                :disabled="!canManuallyUpdateStatus"
                :class="[
                'px-3 py-1 text-sm rounded-lg font-medium border shadow-sm transition-all',
                task.status === statusOption.value
                  ? statusOption.activeClass
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100',
                !canManuallyUpdateStatus ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              {{ statusOption.label }}
            </button>
          </div>
        </header>

        <!-- Açıklama -->
        <section>
          <h2 class="text-lg font-semibold text-blue-700 mb-2">📄 Görev Açıklaması</h2>
          <p class="text-gray-700 bg-blue-50 p-4 rounded-md border border-blue-100 whitespace-pre-line">
            {{ task.description }}
          </p>
        </section>

        <!-- Bağlı Görevler -->
        <section v-if="task.dependencies?.length">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">🔗 Bağlı Görevler</h2>
          <ul class="grid sm:grid-cols-2 gap-4">
            <li
                v-for="dep in task.dependencies"
                :key="dep.id"
                class="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
            >
              <span class="text-gray-800 font-medium">{{ dep.title }}</span>
              <span
                  class="text-xs font-semibold px-2 py-1 rounded"
                  :class="{
          'bg-green-100 text-green-700': dep.status === 'Completed',
          'bg-yellow-100 text-yellow-800': dep.status === 'In Progress',
          'bg-blue-100 text-blue-700': dep.status === 'Ready',
          'bg-gray-200 text-gray-600': dep.status === 'Waiting'
        }"
              >
        {{ dep.status }}
      </span>
            </li>
          </ul>
        </section>


        <!-- Yorumlar -->
        <section>
          <h2 class="text-lg font-semibold text-gray-700 mb-4">💬 Yorumlar</h2>

          <div v-if="commentTree.length" class="space-y-3 max-h-96 overflow-y-auto pr-1">
            <CommentItem
                v-for="comment in commentTree"
                :key="comment.id"
                :comment="comment"
                @replyToggle="toggleReply"
            />
          </div>
          <p v-else class="text-gray-400 italic">Henüz yorum yapılmamış.</p>

          <!-- Yorum Yazma -->
          <form @submit.prevent="submitComment" class="mt-6 space-y-2">
            <div v-if="selectedParentAuthor" class="text-xs text-gray-500 italic">
              {{ selectedParentAuthor }} adlı yoruma yanıt yazıyorsunuz.
              <button
                  type="button"
                  @click="selectedParentId = null"
                  class="ml-2 text-blue-500 hover:underline"
              >
                İptal
              </button>
            </div>
            <textarea
                v-model="newComment"
                rows="4"
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200"
                placeholder="Yorumunuzu yazın..."
            ></textarea>
            <button
                type="submit"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
            >
              Yorum Ekle
            </button>
          </form>
        </section>
      </div>

      <div v-else class="text-center text-gray-500 py-10">
        <p>Görev yükleniyor...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '/pages/components/bar/Navbar.vue'
import CommentItem from '/pages/tasks/CommentItem.vue'

const route = useRoute()
const taskId = route.params.id
const task = ref(null)
const newComment = ref('')
const selectedParentId = ref(null)

const selectedParentAuthor = computed(() => {
  const found = task.value?.comments?.find(c => c.id === selectedParentId.value)
  return found?.author || null
})

type Comment = {
  id: number
  content: string
  createdAt: string
  author: string
  parentId?: number | null
  children?: Comment[]
}

type Task = {
  id: number
  title: string
  description: string
  createdAt: string
  status: 'Waiting' | 'Ready' | 'In Progress' | 'Completed'
  dependencies: {
    id: number
    title: string
    status: 'Waiting' | 'Ready' | 'In Progress' | 'Completed'
  }[]
  comments: Comment[]
}

const statusOptions = [
  { value: 'Ready', label: 'Başlamaya Hazır', activeClass: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'In Progress', label: 'Görev Başlatıldı', activeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'Completed', label: 'Tamamlandı', activeClass: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Waiting', label: 'Bekliyor', activeClass: 'bg-gray-100 text-gray-600 border-gray-300' }
]

const canManuallyUpdateStatus = computed(() => {
  return !task.value?.dependencies || task.value.dependencies.length === 0
})

async function updateStatus(newStatus: Task['status']) {
  console.log('🟢 [updateStatus] çağrıldı:', newStatus)

  if (!task.value?.id) {
    console.warn('⚠️ [updateStatus] Task ID yok')
    return
  }

  try {
    const res = await fetch(`/api/tasks/${task.value.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    })

    console.log('📨 [updateStatus] PATCH gönderildi')

    const result = await res.json()

    console.log('📥 [updateStatus] Yanıt geldi:', result)

    if (!res.ok) {
      console.error('⛔ [updateStatus] Sunucu hatası:', result.message)
      throw new Error(result.message || 'Durum güncellenemedi')
    }

    // Güncel veriyi çek
    console.log('🔄 [updateStatus] fetchTaskById çağrılıyor...')
    await fetchTaskById()

  } catch (err) {
    console.error('❌ [updateStatus] Hata:', err)
  }
}


function buildCommentTree(comments) {
  const map = new Map()
  const root = []

  comments.forEach(c => {
    c.children = []
    map.set(c.id, c)
  })

  comments.forEach(c => {
    if (c.parentId) {
      const parent = map.get(c.parentId)
      if (parent) parent.children.push(c)
    } else {
      root.push(c)
    }
  })

  return root
}

const commentTree = computed(() =>
    task.value?.comments ? buildCommentTree(task.value.comments) : []
)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('tr-TR')
}

function formatDurationSince(dateStr) {
  const created = new Date(dateStr)
  const now = new Date()
  const diffMs = now - created
  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30)

  const parts = []
  if (months) parts.push(`${months} ay`)
  if (days % 30) parts.push(`${days % 30} gün`)
  if (hours % 24) parts.push(`${hours % 24} saat`)
  if (minutes % 60) parts.push(`${minutes % 60} dakika`)
  return parts.length ? parts.join(', ') + ' önce başlatıldı' : 'Yeni oluşturuldu'
}

function toggleReply(commentId) {
  selectedParentId.value = selectedParentId.value === commentId ? null : commentId
}

async function submitComment() {
  const trimmed = newComment.value.trim()
  if (!trimmed || !task.value?.id) {
    console.warn('Yorum veya taskId eksik')
    return
  }

  const payload = {
    content: trimmed,
    parentId: selectedParentId.value,
    taskId: task.value.id
  }

  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Sunucu hatası')
    }

    // Yorum başarıyla eklendi, yeniden veri çek
    await fetchTaskById()


    newComment.value = ''
    selectedParentId.value = null

  } catch (err) {
    console.error('Yorum gönderilemedi:', err)
  }
}


async function fetchTaskById() {
  try {
    const res = await fetch(`/api/tasks/detail/${taskId}`)
    if (!res.ok) throw new Error('Görev alınamadı')

    const data = await res.json()

    if (!Array.isArray(data.comments)) {
      data.comments = []
    }

    task.value = data
  } catch (e) {
    console.error('Görev yüklenemedi:', e)
    task.value = {
      title: 'Görev alınamadı',
      description: '',
      createdAt: new Date().toISOString(),
      status: 'Waiting',
      dependencies: [],
      comments: []
    }
  }
}




onMounted(fetchTaskById)
</script>
