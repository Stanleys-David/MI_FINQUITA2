<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-2xl font-bold text-gray-900">🛒 Mi Carrito</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="overflow-y-auto max-h-[calc(90vh-200px)]">
        <!-- Lista de productos -->
        <div class="p-6">
          <div v-if="items.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">🛒</div>
            <h3 class="text-xl font-medium text-gray-700 mb-2">Tu carrito está vacío</h3>
            <p class="text-gray-500">Agrega productos para continuar</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="item in items" :key="item.id" 
                 class="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
              <!-- Imagen -->
              <img v-if="item.image" 
                   :src="item.image" 
                   :alt="item.name"
                   class="w-16 h-16 object-cover rounded-lg">
              <div v-else class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                  </path>
                </svg>
              </div>

              <!-- Información -->
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
                <p class="text-sm text-gray-500">${{ Number(item.price).toLocaleString() }} c/u</p>
              </div>

              <!-- Controles de cantidad -->
              <div class="flex items-center space-x-2">
                <button @click="updateQuantity(item.id, item.quantity - 1)"
                        :disabled="item.quantity <= 1"
                        class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                </button>
                
                <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
                
                <button @click="updateQuantity(item.id, item.quantity + 1)"
                        :disabled="item.quantity >= item.availability"
                        class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </button>
              </div>

              <!-- Precio total del item -->
              <div class="text-right">
                <p class="font-bold text-emerald-600">
                  ${{ (Number(item.price) * item.quantity).toLocaleString() }}
                </p>
              </div>

              <!-- Botón eliminar -->
              <button @click="removeItem(item.id)" 
                      class="text-red-500 hover:text-red-700 p-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                  </path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Formulario de cliente -->
        <div v-if="items.length > 0" class="p-6 border-t bg-gray-50">
          <h3 class="text-lg font-semibold mb-4">📋 Información del Cliente</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <input v-model="customerInfo.name" 
                     type="text" 
                     required
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                     placeholder="Tu nombre completo">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input v-model="customerInfo.phone" 
                     type="tel" 
                     required
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                     placeholder="300 123 4567">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model="customerInfo.email" 
                     type="email"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                     placeholder="tu@email.com">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
              <textarea v-model="customerInfo.notes" 
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Instrucciones especiales, dirección de entrega, etc."></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con totales y botones -->
      <div v-if="items.length > 0" class="p-6 border-t bg-white">
        <!-- Resumen de totales -->
        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-sm">
            <span>Subtotal ({{ totalItems }} {{ totalItems === 1 ? 'item' : 'items' }})</span>
            <span>${{ subtotal.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>IVA (10%)</span>
            <span>${{ tax.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span class="text-emerald-600">${{ total.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex space-x-3">
          <button @click="$emit('close')" 
                  class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Continuar Comprando
          </button>
          <button @click="proceedToCheckout"
                  :disabled="!canCheckout"
                  :class="[
                    'flex-1 px-4 py-3 rounded-lg font-medium transition-colors',
                    canCheckout
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  ]">
            🛒 Finalizar Compra
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'checkout', 'update-cart'])

const customerInfo = reactive({
  name: '',
  phone: '',
  email: '',
  notes: ''
})

const totalItems = computed(() => 
  props.items.reduce((sum, item) => sum + item.quantity, 0)
)

const subtotal = computed(() => 
  props.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
)

const tax = computed(() => Math.round(subtotal.value * 0.1))

const total = computed(() => subtotal.value + tax.value)

const canCheckout = computed(() => 
  customerInfo.name.trim() && customerInfo.phone.trim() && props.items.length > 0
)

const updateQuantity = (itemId, newQuantity) => {
  if (newQuantity <= 0) {
    removeItem(itemId)
    return
  }

  const updatedItems = props.items.map(item => 
    item.id === itemId ? { ...item, quantity: newQuantity } : item
  )
  emit('update-cart', updatedItems)
}

const removeItem = (itemId) => {
  const updatedItems = props.items.filter(item => item.id !== itemId)
  emit('update-cart', updatedItems)
}

const proceedToCheckout = () => {
  if (!canCheckout.value) return
  
  emit('checkout', customerInfo, props.items)
}
</script> 