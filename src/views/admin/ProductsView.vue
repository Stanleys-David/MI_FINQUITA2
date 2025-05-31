<script setup>
import { useProductsStore } from '../../stores/products'
import Link from '@/components/Link.vue'
import Product from '@/components/Product.vue'
import PageHeader from '@/components/PageHeader.vue'
import { ref, computed, onMounted } from 'vue'

const products = useProductsStore()
const linkCopied = ref(false)
const showStoreInfo = ref(true)

// Cargar productos al montar el componente
onMounted(async () => {
  console.log('🔄 Cargando productos en admin...')
  await products.loadProducts()
  console.log('✅ Productos cargados en admin')
})

// URL de la tienda pública
const publicStoreUrl = `${window.location.origin}/products`

// QR Code URL (usando qr-server.com)
const qrCodeUrl = computed(() => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicStoreUrl)}`
})

// Estadísticas de productos
const productStats = computed(() => {
  const total = products.allProducts.length
  const inStock = products.allProducts.filter(p => p.availability > 0).length
  const outOfStock = total - inStock
  const totalValue = products.allProducts.reduce((sum, p) => sum + (p.price * p.availability), 0)
  
  return {
    total,
    inStock,
    outOfStock,
    totalValue
  }
})

const copyStoreLink = async () => {
  try {
    await navigator.clipboard.writeText(publicStoreUrl)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 3000)
  } catch (error) {
    // Fallback para navegadores que no soportan clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = publicStoreUrl
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 3000)
  }
}

const shareWhatsApp = () => {
  const message = `🌱 *MI FINQUITA - Tienda Online*\n\n` +
    `¡Visita nuestra tienda online y encuentra todos nuestros productos agropecuarios!\n\n` +
    `🛒 Catálogo completo: ${publicStoreUrl}\n\n` +
    `✅ Productos de calidad\n` +
    `✅ Precios competitivos\n` +
    `✅ Compra fácil y rápida\n\n` +
    `¡Esperamos tu visita! 🚀`
  
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}

const shareOnSocialMedia = (platform) => {
  const text = `🌱 Descubre MI FINQUITA - Los mejores productos agropecuarios online`
  const url = publicStoreUrl
  
  const urls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  }
  
  window.open(urls[platform], '_blank', 'width=600,height=400')
}

const openStorePreview = () => {
  window.open(publicStoreUrl, '_blank')
}
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <!-- Page Header -->
        <PageHeader 
            title="Gestión de Productos"
            subtitle="Administra tu inventario y tienda online"
            icon="📦"
            :show-back-button="false"
        />

        <!-- Hero Section - Tienda Online -->
        <div class="max-w-7xl mx-auto px-6 py-8">
            <!-- Store Sharing Card -->
            <div class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white mb-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <!-- Store Info -->
                    <div class="lg:col-span-2">
                        <h2 class="text-2xl font-bold mb-4">🌱 MI FINQUITA</h2>
                        <p class="text-emerald-100 mb-6">
                            Tu tienda está lista para recibir clientes. Comparte el enlace y empieza a vender online.
                        </p>
                        
                        <!-- URL Display -->
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1 mr-4">
                                    <p class="text-emerald-100 text-sm mb-1">URL de tu tienda:</p>
                                    <code class="text-white font-mono text-lg break-all">{{ publicStoreUrl }}</code>
                                </div>
                                <button @click="copyStoreLink" 
                                        :class="[
                                            'px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2',
                                            linkCopied 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-white text-emerald-600 hover:bg-emerald-50'
                                        ]">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path v-if="linkCopied" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M5 13l4 4L19 7"></path>
                                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                    </svg>
                                    <span>{{ linkCopied ? '¡Copiado!' : 'Copiar' }}</span>
                                </button>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex flex-wrap gap-3">
                            <button @click="openStorePreview" 
                                    class="bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                <span>Vista Previa</span>
                            </button>

                            <button @click="shareWhatsApp" 
                                    class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.700"/>
                                </svg>
                                <span>WhatsApp</span>
                            </button>

                            <!-- Dropdown para más opciones -->
                            <div class="relative group">
                                <button class="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center space-x-1">
                                    <span>Más</span>
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                
                                <div class="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[200px]">
                                    <button @click="shareOnSocialMedia('facebook')" 
                                            class="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center space-x-3">
                                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <span class="text-white text-sm font-bold">f</span>
                                        </div>
                                        <span>Facebook</span>
                                    </button>
                                    <button @click="shareOnSocialMedia('twitter')" 
                                            class="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center space-x-3">
                                        <div class="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                                            <span class="text-white text-sm font-bold">𝕏</span>
                                        </div>
                                        <span>Twitter</span>
                                    </button>
                                    <button @click="shareOnSocialMedia('linkedin')" 
                                            class="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center space-x-3">
                                        <div class="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                                            <span class="text-white text-sm font-bold">in</span>
                                        </div>
                                        <span>LinkedIn</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- QR Code -->
                    <div class="text-center">
                        <div class="bg-white p-4 rounded-2xl shadow-lg inline-block">
                            <img :src="qrCodeUrl" alt="QR Code de la tienda" class="w-40 h-40 mx-auto">
                            <p class="text-gray-600 text-sm mt-2 font-medium">Código QR</p>
                        </div>
                        <p class="text-emerald-100 text-sm mt-3">Escanea para visitar la tienda</p>
                    </div>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                            <span class="text-2xl">📦</span>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Total Productos</p>
                            <p class="text-2xl font-bold text-emerald-600">{{ productStats.total }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                            <span class="text-2xl">✅</span>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">En Stock</p>
                            <p class="text-2xl font-bold text-green-600">{{ productStats.inStock }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                            <span class="text-2xl">❌</span>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Agotados</p>
                            <p class="text-2xl font-bold text-red-600">{{ productStats.outOfStock }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mr-4">
                            <span class="text-2xl">💰</span>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Valor Total</p>
                            <p class="text-lg font-bold text-teal-600">${{ productStats.totalValue.toLocaleString() }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Products Section -->
        <div class="max-w-7xl mx-auto px-6 pb-12">
            <!-- Section Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">📋 Gestión de Productos</h2>
                    <p class="text-gray-600">Administra tu catálogo de productos</p>
                </div>
                
                <Link to="new-product" 
                      class="mt-4 sm:mt-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span>Nuevo Producto</span>
                </Link>
            </div>

            <!-- Products Grid -->
            <div v-if="products.noResults" class="text-center py-16">
                <div class="text-6xl mb-4">📦</div>
                <h3 class="text-xl font-medium text-gray-700 mb-2">No hay productos</h3>
                <p class="text-gray-500 mb-6">Agrega tu primer producto para empezar a vender</p>
                <Link to="new-product" 
                      class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                    Agregar Producto
                </Link>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <Product v-for="product in products.allProducts" 
                        :key="product.id" 
                        :product="product" 
                        class="transform transition-transform duration-200 hover:scale-105" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Animaciones personalizadas */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.bg-gradient-to-br {
    animation: fadeInUp 0.6s ease-out;
}

/* Efecto de brillo en el botón principal */
.bg-gradient-to-r:hover {
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

/* Animación del QR Code */
.bg-white img {
    transition: transform 0.3s ease;
}

.bg-white:hover img {
    transform: scale(1.05);
}

/* Estados de hover para las stats cards */
.bg-white:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

/* Dropdown animation */
.group:hover .absolute {
    animation: slideDown 0.2s ease-out forwards;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>

