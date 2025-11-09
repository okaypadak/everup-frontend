<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main class="flex-1">
      <div class="max-w-6xl mx-auto px-4 py-10">
        <!-- Aktif proje bilgisi -->
        <div class="mb-6 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700">
          <p class="text-xs uppercase tracking-wide text-slate-500">Aktif Proje</p>
          <p v-if="projectStore.selectedProjectName" class="font-semibold text-slate-800">
            {{ projectStore.selectedProjectName }}
          </p>
          <p v-else class="text-slate-500">
            Görevler panelinden proje seçin.
          </p>
        </div>

        <!-- Kanban Görünümü -->
        <div v-if="hasActiveProject">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            <div v-for="stage in stages" :key="stage.value" class="bg-gray-100 rounded-xl p-3 shadow-inner flex flex-col gap-2">
              <h3 class="text-sm font-semibold text-black px-2">{{ stage.label }}</h3>
              <draggable
                  :list="filteredCustomersByStage(stage.value)"
                  group="customers"
                  item-key="id"
                  class="flex flex-col gap-2"
                  ghost-class="opacity-50"
                  drag-class="bg-yellow-100"
                  :data-stage="stage.value"
                  @end="onDragEnd"
              >
                <template #item="{ element }">
                  <div
                      class="bg-white rounded-xl p-3 shadow hover:shadow-md cursor-grab"
                      :data-id="element.id"
                      @click="selectCustomer(element)"
                  >
                    <p class="text-sm font-bold text-sky-700">{{ element.firmaAdi }}</p>
                    <p class="text-xs text-black">Yetkili: {{ element.yetkiliKisi }}</p>
                    <p v-if="element.taskStatus" class="text-xs text-sky-600 mt-1">Görev Durumu: {{ element.taskStatus }}</p>
                  </div>
                </template>
              </draggable>
            </div>
          </div>

          <!-- Müşteri Detay Modalı -->
          <div v-if="selectedCustomer" class="fixed inset-0 flex items-center justify-center z-50 bg-black/20 bg-opacity-60">
            <div class="bg-white max-w-xl w-full rounded-xl shadow-lg p-6 relative">
              <button @click="selectedCustomer = null" class="absolute top-2 right-3 text-black hover:text-black">&#10005;</button>
              <h2 class="text-xl font-bold text-sky-700 mb-4">{{ selectedCustomer.firmaAdi }} - Detaylar</h2>
              <div class="space-y-2 text-sm text-black">
                <p><strong>Yetkili:</strong> {{ selectedCustomer.yetkiliKisi }}</p>
                <p><strong>Email:</strong> {{ selectedCustomer.email }}</p>
                <p><strong>Telefon:</strong> {{ selectedCustomer.telefon }}</p>
                <p><strong>Not:</strong> {{ selectedCustomer.notlar || '—' }}</p>
                <p><strong>Görev Durumu:</strong> {{ selectedCustomer.marketingStatus || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- İstatistikler -->
          <div class="mt-8 bg-white rounded-xl shadow p-6">
            <h3 class="text-lg font-bold text-black mb-4 text-center">📊 Genel İstatistikler</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-sm text-black">
              <div v-for="stage in stages" :key="stage.value" class="bg-gray-50 border border-gray-200 rounded p-4 shadow-sm text-center">
                <p class="font-semibold">{{ stage.label }}</p>
                <p class="text-xl font-bold text-sky-600">{{ filteredCustomersByStage(stage.value).length }}</p>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-sm text-black italic mt-4">Görevler panelinden proje seçmeden müşteri panosu yüklenemez.</p>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Navbar from '../components/bar/Navbar.vue'
import Footer from '../components/bar/Footer.vue'
import draggable from 'vuedraggable'
import { useProjectStore } from '@/stores/projectStore'

const projectStore = useProjectStore()
const selectedProjectId = computed(() => projectStore.selectedProjectId)
const hasActiveProject = computed(() => !!selectedProjectId.value)
const selectedCustomer = ref(null)
const newComment = ref('')
const customers = ref([])

const stages = [
  { value: 'NEW_LEAD', label: '🆕 Yeni Müşteri' },
  { value: 'CONTACTED', label: '📞 İletişim Kuruldu' },
  { value: 'UNREACHABLE', label: '📵 Ulaşılamadı' },
  { value: 'IN_NEGOTIATION', label: '🤝 Görüşülüyor' },
  { value: 'WON', label: '✅ Kazanıldı' },
  { value: 'LOST', label: '❌ Vazgeçti' }
]

const refreshCustomers = async () => {
  if (!selectedProjectId.value) {
    customers.value = []
    return
  }
  try {
    const response = await $fetch(`/api/customers/kanban/${selectedProjectId.value}`)
    customers.value = Array.isArray(response) ? response : []
  } catch (e) {
    console.error('Müşteri listesi alınamadı:', e)
    customers.value = []
  }
}

watch(selectedProjectId, refreshCustomers, { immediate: true })

const filteredCustomersByStage = (stage) => {
  return customers.value.filter(c => normalizeStatus(c.marketingStatus) === stage)
}

const normalizeStatus = (status) => {
  return status?.toUpperCase().replaceAll(' ', '_')
}

const selectCustomer = (customer) => {
  selectedCustomer.value = { ...customer }
}

const addComment = () => {
  if (!newComment.value.trim()) return
  if (!selectedCustomer.value.comments) selectedCustomer.value.comments = []
  selectedCustomer.value.comments.push(newComment.value)
  newComment.value = ''
}

const onDragEnd = async (event) => {
  const customerId = event.item.dataset.id
  const newStage = event.to.dataset.stage
  const customer = customers.value.find(c => c.id == customerId)

  if (!customer || normalizeStatus(customer.marketingStatus) === newStage) return

  try {
    customer.marketingStatus = newStage
    await $fetch(`/api/customers/${customerId}/stage`, {
      method: 'PATCH',
      body: { marketingStatus: newStage }
    })
  } catch (err) {
    console.error('Aşama güncellenemedi:', err)
  }
}
</script>

<style scoped>
.opacity-50 {
  opacity: 0.5;
}
.cursor-grab {
  cursor: grab;
}
</style>
