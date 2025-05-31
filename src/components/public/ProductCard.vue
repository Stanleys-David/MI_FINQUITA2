<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
    <!-- Imagen del producto -->
    <div class="relative h-48 bg-gray-200">
      <img 
        v-if="product.image" 
        :src="product.image" 
        :alt="product.name"
        class="w-full h-full object-cover"
        @error="imageError = true"
      />
      <div v-else-if="imageError" 
           class="w-full h-full flex items-center justify-center bg-gray-100">
        <div class="text-center text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
            </path>
          </svg>
          <p class="text-sm">Sin imagen</p>
        </div>
      </div>
      
      <!-- Badge de categoría -->
      <div class="absolute top-2 left-2">
        <span :class="[
          'px-2 py-1 text-xs font-medium rounded-full',
          getCategoryColor(product.category)
        ]">
          {{ getCategoryName(product.category) }}
        </span>
      </div>
      
      <!-- Badge de stock -->
      <div class="absolute top-2 right-2">
        <span :class="[
          'px-2 py-1 text-xs font-medium rounded-full',
          product.availability > 10 
            ? 'bg-green-100 text-green-800'
            : product.availability > 0
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        ]">
          {{ product.availability > 0 ? `${product.availability} disponibles` : 'Agotado' }}
        </span>
      </div>
    </div>

    <!-- Contenido del producto -->
    <div class="p-4">
      <h3 class="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
        {{ product.name }}
      </h3>
      
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-2xl font-bold text-emerald-600">
            ${{ Number(product.price).toLocaleString() }}
          </span>
          <span class="text-sm text-gray-500 ml-1">COP</span>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="space-y-2">
        <!-- Botón Agregar al Carrito -->
        <button 
          @click="$emit('add-to-cart', product)"
          :disabled="product.availability === 0"
          :class="[
            'w-full py-2 px-4 rounded-lg font-medium transition-colors',
            product.availability > 0
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]">
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m9.5-6v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01">
            </path>
          </svg>
          {{ product.availability > 0 ? 'Agregar al Carrito' : 'Agotado' }}
        </button>

        <!-- Botones inferiores -->
        <div class="flex space-x-2">
          <!-- Botón Comprar Ahora -->
          <button 
            @click="$emit('buy-now', product)"
            :disabled="product.availability === 0"
            :class="[
              'flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm',
              product.availability > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]">
            🛒 Comprar
          </button>

          <!-- Botón WhatsApp -->
          <button 
            @click="consultWhatsApp"
            class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm">
            <svg class="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.700"/>
            </svg>
            Consultar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  product: {
    type: Object,
    required: true
  }
})

defineEmits(['add-to-cart', 'buy-now'])

const imageError = ref(false)

// Número de WhatsApp (mismo que en la vista principal)
const whatsappNumber = '573134486777'

const getCategoryName = (categoryId) => {
  const categories = {
    1: 'FERTILIZANTES',
    2: 'MÁQUINAS',
    3: 'INSECTICIDAS',
    4: 'VITAMINAS'
  }
  return categories[categoryId] || 'GENERAL'
}

const getCategoryColor = (categoryId) => {
  const colors = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-red-100 text-red-800',
    4: 'bg-purple-100 text-purple-800'
  }
  return colors[categoryId] || 'bg-gray-100 text-gray-800'
}

const consultWhatsApp = () => {
  const message = `🌱 *Consulta sobre producto*\n\n` +
    `📦 Producto: ${props.product.name}\n` +
    `💰 Precio: $${Number(props.product.price).toLocaleString()}\n` +
    `📋 Categoría: ${getCategoryName(props.product.category)}\n` +
    `📊 Disponibilidad: ${props.product.availability} unidades\n\n` +
    `Hola, me interesa este producto. ¿Podrías darme más información? 😊`
  
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 