<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSalesStore } from '@/stores/sales'
import { formatCurrency } from '@/helpers'
import PageHeader from '@/components/PageHeader.vue'

const sales = useSalesStore()
const selectedTab = ref('recent') // recent, today, all
const selectedStatus = ref('all') // all, pending, confirmed, delivered, cancelled

// Cargar ventas al montar el componente
onMounted(async () => {
  try {
    await sales.fetchSales()
  } catch (error) {
    console.error('Error al cargar ventas:', error)
  }
})

const filteredSales = computed(() => {
  let filtered = []
  
  // Filtrar por tab
  switch (selectedTab.value) {
    case 'recent':
      filtered = sales.recentSales
      break
    case 'today':
      filtered = sales.todaysSales
      break
    case 'all':
      filtered = sales.sales
      break
    default:
      filtered = sales.sales
  }
  
  // Filtrar por estado
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(sale => sale.status === selectedStatus.value)
  }
  
  return filtered
})

const totalFilteredSales = computed(() => 
  filteredSales.value.reduce((sum, sale) => sum + sale.total, 0)
)

// Estadísticas avanzadas
const salesStats = computed(() => {
  const allSales = sales.sales
  const today = sales.todaysSales
  const todayTotal = today.reduce((sum, sale) => sum + sale.total, 0)
  const avgOrderValue = allSales.length > 0 ? sales.totalSales / allSales.length : 0
  
  // Ventas por estado
  const statusCounts = {
    pending: allSales.filter(s => s.status === 'pending').length,
    confirmed: allSales.filter(s => s.status === 'confirmed').length,
    delivered: allSales.filter(s => s.status === 'delivered').length,
    cancelled: allSales.filter(s => s.status === 'cancelled').length
  }
  
  return {
    totalSales: sales.totalSales,
    totalOrders: allSales.length,
    todayOrders: today.length,
    todayTotal,
    avgOrderValue,
    statusCounts
  }
})

const updateStatus = async (saleId, newStatus) => {
  try {
    const sale = sales.getSaleById(saleId)
    const previousStatus = sale?.status
    
    // Mostrar mensaje informativo sobre el inventario
    if (previousStatus !== 'delivered' && newStatus === 'delivered') {
      const confirmDelivery = confirm(
        '🚚 ¿Confirmar entrega?\n\n' +
        'Al marcar como "Entregado", se descontará automáticamente el inventario de los productos.\n\n' +
        '¿Proceder con la entrega?'
      )
      if (!confirmDelivery) return
    }
    
    if (previousStatus === 'delivered' && newStatus !== 'delivered') {
      const confirmChange = confirm(
        '⚠️ ¿Cambiar estado de entregado?\n\n' +
        'Al quitar el estado "Entregado", se restaurará automáticamente el inventario de los productos.\n\n' +
        '¿Proceder con el cambio?'
      )
      if (!confirmChange) return
    }
    
    await sales.updateSaleStatus(saleId, newStatus)
    
    // Mostrar mensaje de éxito específico
    if (previousStatus !== 'delivered' && newStatus === 'delivered') {
      showNotification('✅ Venta marcada como entregada e inventario actualizado', 'success')
    } else if (previousStatus === 'delivered' && newStatus !== 'delivered') {
      showNotification('🔄 Estado cambiado e inventario restaurado', 'success') 
    } else {
      showNotification('✅ Estado actualizado correctamente', 'success')
    }
  } catch (error) {
    console.error('Error al actualizar estado:', error)
    if (error.message.includes('Stock insuficiente')) {
      showNotification(`❌ ${error.message}`, 'error')
    } else {
      showNotification('❌ Error al actualizar el estado', 'error')
    }
  }
}

const showNotification = (message, type) => {
  // Implementación simple de notificación (podrías usar una librería más avanzada)
  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`
  notification.textContent = message
  document.body.appendChild(notification)
  
  setTimeout(() => {
    document.body.removeChild(notification)
  }, 3000)
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Fecha no disponible'
  
  let date
  if (timestamp.toDate) {
    date = timestamp.toDate()
  } else {
    date = new Date(timestamp)
  }
  
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getSourceIcon = (source) => {
  if (source === 'public_store') return '🛍️'
  return '🏪'
}

const getSourceText = (source) => {
  if (source === 'public_store') return 'Tienda Pública'
  return 'Admin'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: '⏳',
    confirmed: '✅', 
    delivered: '🚚',
    cancelled: '❌'
  }
  return icons[status] || '📋'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
    <!-- Page Header -->
    <PageHeader 
        title="Dashboard de Ventas"
        subtitle="Monitorea el rendimiento de tu negocio agropecuario"
        icon="📊"
        custom-back-route="products"
    />

    <!-- Hero Dashboard -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Stats Dashboard -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Ventas -->
        <div class="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-emerald-100 text-sm font-medium">Total Ventas</p>
              <p class="text-2xl font-bold">{{ formatCurrency(salesStats.totalSales) }}</p>
              <p class="text-emerald-100 text-xs mt-1">{{ salesStats.totalOrders }} órdenes</p>
            </div>
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span class="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <!-- Ventas Hoy -->
        <div class="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-teal-100 text-sm font-medium">Ventas Hoy</p>
              <p class="text-2xl font-bold">{{ formatCurrency(salesStats.todayTotal) }}</p>
              <p class="text-teal-100 text-xs mt-1">{{ salesStats.todayOrders }} órdenes</p>
            </div>
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <!-- Promedio por Orden -->
        <div class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium">Promedio por Orden</p>
              <p class="text-2xl font-bold">{{ formatCurrency(salesStats.avgOrderValue) }}</p>
              <p class="text-green-100 text-xs mt-1">Valor medio</p>
            </div>
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <!-- Estados -->
        <div class="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between mb-3">
            <p class="text-orange-100 text-sm font-medium">Estados de Órdenes</p>
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span class="text-lg">📋</span>
            </div>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between text-xs">
              <span class="text-orange-100">Pendientes:</span>
              <span class="font-bold">{{ salesStats.statusCounts.pending }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-orange-100">Confirmadas:</span>
              <span class="font-bold">{{ salesStats.statusCounts.confirmed }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 pb-12">
      <!-- Controls Section -->
      <div class="bg-white rounded-2xl shadow-xl border border-emerald-100 p-6 mb-8">
        <!-- Información sobre el inventario -->
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
          <div class="flex items-start space-x-3">
            <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-lg">💡</span>
            </div>
            <div>
              <h4 class="font-semibold text-emerald-900 mb-2">📦 Manejo de Inventario</h4>
              <p class="text-sm text-emerald-800 leading-relaxed">
                • Las ventas <strong>NO</strong> descuentan inventario automáticamente<br>
                • El inventario se descuenta <strong>únicamente</strong> cuando marcas una venta como <span class="font-bold text-green-700">"Entregado"</span><br>
                • Si cambias una venta de "Entregado" a otro estado, el inventario se restaura automáticamente<br>
                • Las ventas canceladas que no fueron entregadas no afectan el inventario
              </p>
            </div>
          </div>
        </div>

        <!-- Tabs de filtrado -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span class="text-2xl mr-2">🔍</span>
            Filtros de Búsqueda
          </h3>
          <div class="flex flex-wrap gap-2">
            <button @click="selectedTab = 'recent'"
                    :class="[
                      'px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300',
                      selectedTab === 'recent'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                    ]">
              ⚡ Recientes
            </button>
            <button @click="selectedTab = 'today'"
                    :class="[
                      'px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300',
                      selectedTab === 'today'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                    ]">
              📅 Hoy ({{ sales.todaysSales.length }})
            </button>
            <button @click="selectedTab = 'all'"
                    :class="[
                      'px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300',
                      selectedTab === 'all'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                    ]">
              📋 Todas ({{ sales.sales.length }})
            </button>
          </div>
        </div>

        <!-- Filtros adicionales -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex items-center space-x-3">
            <label class="text-sm font-medium text-gray-700">Estado:</label>
            <select v-model="selectedStatus" 
                    class="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm">
              <option value="all">🔄 Todos</option>
              <option value="pending">⏳ Pendientes</option>
              <option value="confirmed">✅ Confirmados</option>
              <option value="delivered">🚚 Entregados</option>
              <option value="cancelled">❌ Cancelados</option>
            </select>
          </div>
          
          <div class="bg-emerald-50 px-4 py-2 rounded-xl">
            <span class="text-sm text-emerald-600 font-medium">
              Total filtrado: <span class="font-bold text-emerald-800">{{ formatCurrency(totalFilteredSales) }}</span>
                    </span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="sales.loading" class="text-center py-16">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <h3 class="text-xl font-medium text-gray-700 mb-2">Cargando ventas...</h3>
        <p class="text-gray-500">Obteniendo datos del servidor</p>
      </div>

      <!-- Sales List -->
      <div v-else-if="filteredSales.length > 0" class="space-y-6">
        <div v-for="sale in filteredSales" :key="sale.id" 
             class="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          
          <!-- Sale Header -->
          <div class="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span class="text-2xl">{{ getSourceIcon(sale.source) }}</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold">
                    Orden #{{ sale.id.slice(-6).toUpperCase() }}
                  </h3>
                  <p class="text-emerald-200">
                    {{ getSourceText(sale.source) }} • {{ formatDate(sale.createdAt) }}
                  </p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3 mt-4 sm:mt-0">
                <!-- Status Badge -->
                <div :class="[
                  'px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2',
                  sale.status === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                  sale.status === 'confirmed' ? 'bg-blue-400 text-blue-900' :
                  sale.status === 'delivered' ? 'bg-green-400 text-green-900' :
                  'bg-red-400 text-red-900'
                ]">
                  <span>{{ getStatusIcon(sale.status) }}</span>
                  <span>{{ sales.getStatusText(sale.status) }}</span>
                </div>
                
                <!-- Status Selector -->
                <select @change="updateStatus(sale.id, $event.target.value)"
                        :value="sale.status"
                        class="bg-white/20 text-white border border-white/30 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-white/50">
                  <option value="pending" class="text-gray-900">Pendiente</option>
                  <option value="confirmed" class="text-gray-900">Confirmado</option>
                  <option value="delivered" class="text-gray-900">Entregado</option>
                  <option value="cancelled" class="text-gray-900">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Sale Content -->
          <div class="p-6">
            <!-- Customer Info -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                  <span class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <span class="text-lg">👤</span>
                  </span>
                  Información del Cliente
                </h4>
                <div class="space-y-2">
                  <p class="text-sm"><span class="font-medium text-gray-700">Nombre:</span> {{ sale.customer.name }}</p>
                  <p class="text-sm"><span class="font-medium text-gray-700">Teléfono:</span> {{ sale.customer.phone }}</p>
                  <p v-if="sale.customer.email" class="text-sm"><span class="font-medium text-gray-700">Email:</span> {{ sale.customer.email }}</p>
                </div>
              </div>
              
              <div v-if="sale.customer.notes" class="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                  <span class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                    <span class="text-lg">📋</span>
                  </span>
                  Notas Especiales
                </h4>
                <p class="text-sm text-gray-700 italic">{{ sale.customer.notes }}</p>
              </div>
            </div>

            <!-- Products -->
            <div class="mb-6">
              <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
                <span class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-lg">📦</span>
                </span>
                Productos Pedidos
              </h4>
              <div class="space-y-3">
                <div v-for="item in sale.items" :key="item.productId" 
                     class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors border border-gray-100">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center">
                      <img v-if="item.image" 
                           :src="item.image" 
                           :alt="item.name"
                           class="w-full h-full object-cover">
                      <span v-else class="text-gray-400 text-lg">📦</span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ item.name }}</p>
                      <p class="text-sm text-gray-500">
                        {{ formatCurrency(item.price) }} × {{ item.quantity }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-lg text-emerald-600">
                      {{ formatCurrency(item.price * item.quantity) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Totals -->
            <div class="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
              <div class="flex justify-end">
                <div class="w-80 space-y-3">
                  <div class="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>{{ formatCurrency(sale.subtotal) }}</span>
                  </div>
                  <div class="flex justify-between text-sm text-gray-600">
                    <span>IVA (10%):</span>
                    <span>{{ formatCurrency(sale.tax) }}</span>
                  </div>
                  <div class="border-t border-emerald-200 pt-3">
                    <div class="flex justify-between text-xl font-bold">
                      <span class="text-gray-900">Total:</span>
                      <span class="text-emerald-600">{{ formatCurrency(sale.total) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
          <span class="text-4xl">📈</span>
        </div>
        <h3 class="text-2xl font-medium text-gray-700 mb-3">
          {{ selectedTab === 'today' ? 'No hay ventas hoy' : 'No hay ventas registradas' }}
        </h3>
        <p class="text-gray-500 mb-6 max-w-md mx-auto">
          {{ selectedTab === 'today' 
            ? 'Aún no se han realizado ventas el día de hoy. ¡Comparte tu tienda para empezar a vender!' 
            : 'Cuando tengas ventas, aparecerán aquí organizadas y fáciles de gestionar.' 
          }}
        </p>
        <a href="/admin/productos" class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-lg">
          Ver Productos
        </a>
      </div>
    </div>
    </div>
</template>

<style scoped>
/* Animaciones personalizadas */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-gradient-to-br {
  animation: fadeInUp 0.6s ease-out;
}

/* Efectos de hover para las cards */
.bg-white:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Animación de los stats cards */
.bg-gradient-to-r {
  position: relative;
  overflow: hidden;
}

.bg-gradient-to-r::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Transiciones suaves para los botones */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: translateY(-1px);
}

/* Estilo para los selects */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>

