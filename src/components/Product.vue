<script setup>
import { computed } from 'vue';
import { useProductsStore } from '../stores/products'
import { formatCurrency } from '@/helpers'
const products = useProductsStore()
const props = defineProps({
    product: {
        type: Object
    }
})
const isProductNotAvailable = computed(() => props.product.availability === 0)

const getCategoryIcon = (category) => {
    const icons = {
        1: '🌱', // Fertilizantes
        2: '🚜', // Máquinas  
        3: '🦗', // Insecticidas
        4: '💊'  // Vitaminas
    }
    return icons[category] || '📦'
}

const getCategoryName = (category) => {
    const names = {
        1: 'Fertilizantes',
        2: 'Máquinas',
        3: 'Insecticidas', 
        4: 'Vitaminas'
    }
    return names[category] || 'Sin categoría'
}

const getStockStatus = () => {
    if (props.product.availability === 0) return { text: 'Agotado', color: 'text-red-600', bg: 'bg-red-100' }
    if (props.product.availability <= 5) return { text: 'Stock bajo', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { text: 'En stock', color: 'text-green-600', bg: 'bg-green-100' }
}
</script>

<template>
    <div class="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
         :class="{ 'opacity-75': isProductNotAvailable }">
        
        <!-- Product Image -->
        <div class="relative h-48 bg-gradient-to-br from-emerald-50 to-green-50">
            <img :src="product.image" 
                 :alt="product.name" 
                 class="w-full h-full object-cover">
            
            <!-- Category Badge -->
            <div class="absolute top-3 left-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <span class="mr-1">{{ getCategoryIcon(product.category) }}</span>
                    {{ getCategoryName(product.category) }}
                </span>
            </div>
            
            <!-- Stock Status Badge -->
            <div class="absolute top-3 right-3">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="[getStockStatus().bg, getStockStatus().color]">
                    {{ getStockStatus().text }}
                </span>
            </div>
            
            <!-- Out of stock overlay -->
            <div v-if="isProductNotAvailable" 
                 class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span class="text-white font-bold text-lg">AGOTADO</span>
            </div>
        </div>
        
        <!-- Product Content -->
        <div class="p-6">
            <div class="mb-4">
                <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{{ product.name }}</h3>
                <div class="flex items-center justify-between">
                    <span class="text-2xl font-bold text-emerald-600">{{ formatCurrency(product.price) }}</span>
                    <div class="text-right">
                        <p class="text-sm text-gray-500">Stock disponible</p>
                        <p class="text-lg font-semibold" :class="getStockStatus().color">
                            {{ product.availability }} unidades
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center justify-between pt-4 border-t border-emerald-100">
                <!-- Edit Button -->
                <RouterLink :to="{ name: 'edit-product', params: { id: product.id } }"
                           class="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <span class="text-sm font-medium">Editar</span>
                </RouterLink>
                
                <!-- Delete Button -->
                <button type="button" 
                        @click="products.deleteProduct(product.id)"
                        class="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    <span class="text-sm font-medium">Eliminar</span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>

