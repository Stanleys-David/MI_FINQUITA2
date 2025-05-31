<script setup>
import { watch, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import Link from '@/components/Link.vue';
import PageHeader from '@/components/PageHeader.vue'
import { useProductsStore } from '@/stores/products';
import useImage from '@/composables/useImage'

// Consultar firestore
const route = useRoute()
const router = useRouter()
const db = useFirestore()
const docRef = doc(db, 'products', route.params.id)
const product = useDocument(docRef)
const { onFileChange, url, isImageUploaded } = useImage()
const products = useProductsStore()

const formData = reactive({
    name: '',
    category: '',
    price: '',
    availability: '',
    image: ''
})

watch(product, (product) => {
    if (!product) {
        router.push(({ name: 'products' }))
    }
    Object.assign((formData), product)
})

const submitHandler = async (data) => {
    try {
        await products.updateProduct(docRef, { ...data, url })
        router.push({ name: 'products' })
    } catch (error) {
        console.error(error)
    }
}

const getCategoryIcon = (categoryValue) => {
    const icons = {
        1: '🌱', // Fertilizantes
        2: '🚜', // Máquinas  
        3: '🦗', // Insecticidas
        4: '💊'  // Vitaminas
    }
    return icons[categoryValue] || '📦'
}

const getCategoryName = (categoryValue) => {
    const names = {
        1: 'Fertilizantes',
        2: 'Máquinas',
        3: 'Insecticidas', 
        4: 'Vitaminas'
    }
    return names[categoryValue] || 'Seleccionar categoría'
}

const isFormValid = computed(() => {
    return formData.name?.trim() && 
           formData.category && 
           formData.price && 
           formData.availability !== undefined
})
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
        <!-- Page Header -->
        <PageHeader 
            title="Editar Producto"
            subtitle="Actualiza la información del producto en tu catálogo"
            icon="✏️"
            custom-back-route="products"
        />

        <!-- Main Content -->
        <div class="max-w-4xl mx-auto px-6 py-8">
            <!-- Form Card -->
            <div class="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
                <div class="p-8">
                    <FormKit type="form" 
                             :value="formData"
                             submit-label="💾 Guardar Cambios"
                             incomplete-message="⚠️ Por favor completa todos los campos requeridos"
                             :classes="{
                                 form: 'space-y-8',
                                 submit: 'w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                             }"
                             @submit="submitHandler">

                        <!-- Product Name Section -->
                        <div class="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                            <div class="flex items-center mb-4">
                                <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                    <span class="text-xl">📝</span>
                                </div>
                                <h3 class="text-lg font-semibold text-gray-900">Información Básica</h3>
                            </div>
                            
                            <FormKit type="text" 
                                     label="Nombre del Producto" 
                                     name="name" 
                                     placeholder="Ej: Fertilizante Orgánico Premium"
                                     validation="required"
                                     :validation-messages="{ required: 'El nombre del producto es obligatorio' }"
                                     v-model.trim="formData.name"
                                     :classes="{
                                         outer: 'mb-0',
                                         input: 'mt-2 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors'
                                     }" />
                        </div>

                        <!-- Image Section -->
                        <div class="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                            <div class="flex items-center mb-4">
                                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <span class="text-xl">📸</span>
                                </div>
                                <h3 class="text-lg font-semibold text-gray-900">Imagen del Producto</h3>
                            </div>

                            <!-- Current/New Image Preview -->
                            <div class="mb-6">
                                <div v-if="isImageUploaded" class="mb-4">
                                    <div class="flex items-center mb-3">
                                        <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <p class="font-medium text-green-600">Nueva imagen seleccionada</p>
                                    </div>
                                    <div class="relative inline-block">
                                        <img :src="url" 
                                             alt="Nueva imagen del producto" 
                                             class="w-48 h-48 object-cover rounded-xl shadow-lg border-4 border-white">
                                        <div class="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                
                                <div v-else-if="formData.image" class="mb-4">
                                    <p class="font-medium text-gray-700 mb-3">Imagen actual:</p>
                                    <img :src="formData.image" 
                                         :alt="'Imagen de ' + formData.name" 
                                         class="w-48 h-48 object-cover rounded-xl shadow-lg border-4 border-emerald-100">
                                </div>
                            </div>

                            <FormKit type="file" 
                                     label="Cambiar imagen (opcional)" 
                                     name="image" 
                                     accept=".jpg,.jpeg,.png,.webp"
                                     @change="onFileChange"
                                     :classes="{
                                         outer: 'mb-0',
                                         input: 'mt-2 block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-400 transition-colors cursor-pointer'
                                     }" />
                        </div>

                        <!-- Category and Details Section -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Category -->
                            <div class="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                                <div class="flex items-center mb-4">
                                    <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                                        <span class="text-xl">🏷️</span>
                                    </div>
                                    <h3 class="text-lg font-semibold text-gray-900">Categoría</h3>
                                </div>
                                
                                <FormKit type="select" 
                                         label="Seleccionar categoría" 
                                         name="category" 
                                         validation="required"
                                         :validation-messages="{ required: 'La categoría es obligatoria' }"
                                         :options="products.categoryOptions" 
                                         v-model.number="formData.category"
                                         :classes="{
                                             outer: 'mb-0',
                                             input: 'mt-2 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors'
                                         }" />
                                
                                <!-- Category Preview -->
                                <div v-if="formData.category" class="mt-4 p-3 bg-white rounded-lg border border-emerald-200">
                                    <div class="flex items-center">
                                        <span class="text-2xl mr-3">{{ getCategoryIcon(formData.category) }}</span>
                                        <div>
                                            <p class="font-medium text-gray-900">{{ getCategoryName(formData.category) }}</p>
                                            <p class="text-sm text-gray-500">Categoría seleccionada</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Price -->
                            <div class="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                                <div class="flex items-center mb-4">
                                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                        <span class="text-xl">💰</span>
                                    </div>
                                    <h3 class="text-lg font-semibold text-gray-900">Precio</h3>
                                </div>
                                
                                <FormKit type="number" 
                                         label="Precio del producto (COP)" 
                                         name="price" 
                                         validation="required"
                                         placeholder="50000"
                                         :validation-messages="{ required: 'El precio es obligatorio' }" 
                                         min="1"
                                         v-model.number="formData.price"
                                         :classes="{
                                             outer: 'mb-0',
                                             input: 'mt-2 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors'
                                         }" />
                                
                                <!-- Price Preview -->
                                <div v-if="formData.price" class="mt-4 p-3 bg-white rounded-lg border border-green-200">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-gray-600">Precio actual:</span>
                                        <span class="text-lg font-bold text-green-600">
                                            ${{ Number(formData.price).toLocaleString() }} COP
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Availability Section -->
                        <div class="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                            <div class="flex items-center mb-4">
                                <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                                    <span class="text-xl">📦</span>
                                </div>
                                <h3 class="text-lg font-semibold text-gray-900">Inventario</h3>
                            </div>
                            
                            <FormKit type="number" 
                                     label="Cantidad disponible" 
                                     name="availability" 
                                     validation="required"
                                     placeholder="100"
                                     :validation-messages="{ required: 'La cantidad es obligatoria' }" 
                                     min="0"
                                     v-model.number="formData.availability"
                                     :classes="{
                                         outer: 'mb-0',
                                         input: 'mt-2 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors'
                                     }" />
                            
                            <!-- Availability Preview -->
                            <div v-if="formData.availability !== undefined" class="mt-4 p-3 bg-white rounded-lg border border-teal-200">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-600">Stock actual:</span>
                                    <div class="flex items-center">
                                        <span class="text-lg font-bold text-teal-600 mr-2">{{ formData.availability }}</span>
                                        <span class="text-sm text-gray-500">unidades</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Form Status -->
                        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                                         :class="isFormValid ? 'bg-green-100' : 'bg-gray-100'">
                                        <span class="text-xl">{{ isFormValid ? '✅' : '⏳' }}</span>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900">
                                            {{ isFormValid ? 'Listo para actualizar' : 'Completar información' }}
                                        </h3>
                                        <p class="text-sm text-gray-600">
                                            {{ isFormValid 
                                                ? 'Todos los campos están completos. ¡Puedes guardar los cambios!' 
                                                : 'Completa todos los campos para poder actualizar el producto.' 
                                            }}
                                        </p>
                                    </div>
                                </div>
                                <div v-if="isFormValid" class="text-green-500">
                                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                </FormKit>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Animaciones personalizadas */
@keyframes slideInUp {
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
    animation: slideInUp 0.6s ease-out;
}

/* Focus states mejorados */
input:focus, select:focus, textarea:focus {
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
</style>
