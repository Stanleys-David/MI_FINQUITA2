<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
    <!-- Page Header -->
    <PageHeader 
        title="MI FINQUITA"
        subtitle="Productos Agropecuarios de Calidad"
        icon="🌱"
        :show-back-button="false"
    />

    <!-- Botón de carrito flotante en la esquina -->
    <div class="fixed top-20 right-6 z-40">
      <button @click="showCart = true" 
              class="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m9.5-6v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01">
          </path>
        </svg>
        <span v-if="cartItems.length > 0" 
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
          {{ cartItems.length }}
        </span>
      </button>
    </div>

    <!-- WhatsApp flotante -->
    <div class="fixed bottom-6 right-6 z-40">
      <a :href="contactWhatsAppLink" target="_blank" 
         class="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-300 transform hover:scale-105">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.700"/>
        </svg>
        <span class="hidden sm:block">Contactar</span>
      </a>
    </div>

    <!-- Filtros de categoría -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-wrap gap-3 justify-center">
        <button v-for="category in categories" :key="category.id"
                @click="selectedCategory = category.id"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  selectedCategory === category.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-emerald-600 hover:bg-emerald-50'
                ]">
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- Productos -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando productos...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🌱</div>
        <h3 class="text-xl font-medium text-gray-700 mb-2">No hay productos disponibles</h3>
        <p class="text-gray-500">En esta categoría no hay productos en stock</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard 
          v-for="product in filteredProducts" 
          :key="product.id"
          :product="product"
          @add-to-cart="addToCart"
          @buy-now="buyNow"
        />
      </div>
    </div>

    <!-- Modal del Carrito -->
    <CartModal v-if="showCart" @close="showCart = false" :items="cartItems" @checkout="checkout" @update-cart="updateCart" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useSalesStore } from '@/stores/sales'
import ProductCard from '@/components/public/ProductCard.vue'
import CartModal from '@/components/public/CartModal.vue'
import PageHeader from '@/components/PageHeader.vue'

const products = useProductsStore()
const sales = useSalesStore()
const loading = ref(true)
const selectedCategory = ref(0)
const showCart = ref(false)
const cartItems = ref([])

// Número de WhatsApp de la tienda (cambiar por el real)
const whatsappNumber = '573134486777' // Ejemplo: +57 300 123 4567
const contactWhatsAppLink = computed(() => {
  const message = `¡Hola! 👋 Vi los productos de MI FINQUITA y me gustaría obtener más información.`
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
})

const categories = [
  { id: 0, name: 'TODOS' },
  { id: 1, name: 'FERTILIZANTES' },
  { id: 2, name: 'MÁQUINAS' },
  { id: 3, name: 'INSECTICIDAS' },
  { id: 4, name: 'VITAMINAS' }
]

const filteredProducts = computed(() => {
  const availableProducts = products.allProducts.filter(p => p.availability > 0)
  
  if (selectedCategory.value === 0) {
    return availableProducts
  }
  
  return availableProducts.filter(p => p.category === selectedCategory.value)
})

const addToCart = (product) => {
  console.log('🛒 Agregando al carrito producto con ID:', product.id)
  
  if (!product.id) {
    console.error('❌ Producto sin ID:', product)
    alert('Error: Este producto no tiene un ID válido')
    return
  }
  
  const existingItem = cartItems.value.find(item => item.id === product.id)
  
  if (existingItem) {
    if (existingItem.quantity < product.availability) {
      existingItem.quantity++
    } else {
      alert('No hay más stock disponible')
    }
  } else {
    const cartItem = {
      ...product,
      quantity: 1
    }
    cartItems.value.push(cartItem)
  }
  
  console.log('✅ Producto agregado al carrito')
}

const updateCart = (updatedItems) => {
  cartItems.value = updatedItems
}

const buyNow = (product) => {
  // Agregar al carrito y abrir modal
  addToCart(product)
  showCart.value = true
}

const checkout = async (customerInfo, items) => {
  try {
    console.log('🔄 Procesando compra:', { customerInfo, items })
    
    // Validar que tenemos datos válidos
    if (!customerInfo.name?.trim() || !customerInfo.phone?.trim()) {
      alert('Por favor completa nombre y teléfono')
      return
    }
    
    if (!items || items.length === 0) {
      alert('El carrito está vacío')
      return
    }
    
    // Validar que todos los productos tienen ID válido
    for (const item of items) {
      console.log('🔍 Validando item:', item)
      if (!item.id) {
        console.error('❌ Item sin ID:', item)
        alert(`Error: El producto "${item.name}" no tiene un ID válido`)
        return
      }
    }
    
    // Calcular totales con validación
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.price) || 0
      const quantity = Number(item.quantity) || 0
      return sum + (price * quantity)
    }, 0)
    
    const tax = Math.round(subtotal * 0.1)
    const total = subtotal + tax
    
    // Validar totales
    if (isNaN(subtotal) || isNaN(tax) || isNaN(total) || total <= 0) {
      alert('Error en el cálculo de totales')
      return
    }
    
    // Crear la venta en Firebase con todos los campos validados
    const saleData = {
      customer: {
        name: String(customerInfo.name || '').trim(),
        phone: String(customerInfo.phone || '').trim(),
        email: String(customerInfo.email || '').trim(),
        notes: String(customerInfo.notes || '').trim()
      },
      items: items.map(item => {
        const productId = String(item.id || '').trim()
        
        // Validación adicional
        if (!productId) {
          throw new Error(`Producto "${item.name}" no tiene un ID válido`)
        }
        
        return {
          productId: productId,
          name: String(item.name || '').trim(),
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: String(item.image || '').trim(),
          category: Number(item.category) || 0
        }
      }),
      subtotal: Number(subtotal),
      tax: Number(tax),
      total: Number(total),
      source: 'public_store',
      paymentMethod: 'whatsapp'
    }
    
    console.log('✅ Datos de venta validados:', saleData)
    
    const saleId = await sales.createSale(saleData)
    console.log('✅ Venta creada con ID:', saleId)
    
    // Limpiar carrito
    cartItems.value = []
    showCart.value = false
    
    // Mostrar mensaje de éxito y generar WhatsApp
    const orderSummary = items.map(item => 
      `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`
    ).join('\n')
    
    const whatsappMessage = `🛒 *Nueva Orden - MI FINQUITA*\n\n` +
      `📝 *ID de Orden:* ${saleId.slice(-6).toUpperCase()}\n\n` +
      `👤 *Cliente:* ${customerInfo.name}\n` +
      `📧 *Email:* ${customerInfo.email || 'No proporcionado'}\n` +
      `📱 *Teléfono:* ${customerInfo.phone}\n` +
      (customerInfo.notes ? `📋 *Notas:* ${customerInfo.notes}\n` : '') +
      `\n📦 *Productos:*\n${orderSummary}\n\n` +
      `💰 *Subtotal:* $${subtotal.toLocaleString()}\n` +
      `💰 *IVA (10%):* $${tax.toLocaleString()}\n` +
      `💰 *Total:* $${total.toLocaleString()}*\n\n` +
      `¡Gracias por tu compra! Confirma tu pedido y coordinaremos la entrega. 🌱`
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappUrl, '_blank')
    
    alert('¡Compra procesada exitosamente! Se abrirá WhatsApp para confirmar tu pedido.')
    
  } catch (error) {
    console.error('❌ Error al procesar compra:', error)
    alert(`Error al procesar la compra: ${error.message || 'Error desconocido'}. Intenta nuevamente.`)
  }
}

onMounted(async () => {
  try {
    loading.value = true;
    console.log('🔄 Iniciando carga de productos...');
    
    // Cargar productos desde Firebase
    await products.loadProducts();
    
    console.log('✅ Productos cargados exitosamente');
    loading.value = false;
  } catch (error) {
    console.error('❌ Error al cargar productos:', error);
    loading.value = false;
  }
})
</script> 