<script setup>
import Link from './Link.vue';
import Logo from './Logo.vue';
import { useProductsStore } from '../stores/products';
import { useSalesStore } from '../stores/sales';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import ListItemCartShop from './ListItemCartShop.vue';
import { useAuthStore } from '@/stores/auth'
import { ref, computed, onMounted } from 'vue';

const auth = useAuthStore()
const products = useProductsStore();
const sales = useSalesStore();
const isCartVisible = ref(false);
const showMobileMenu = ref(false);

// Cargar datos al montar
onMounted(async () => {
  console.log('🔄 MainNav mounted - Estado de auth:', auth.isAuth);
  console.log('🔄 UserData:', auth.userData);
  
  try {
    // Cargar productos siempre (no depende de autenticación para mostrar estadísticas)
    console.log('🔄 Cargando productos...');
    await products.loadProducts();
    console.log('✅ Productos cargados en MainNav:', products.allProducts.length);
    
    // Cargar ventas solo si está autenticado
    if (auth.isAuth) {
      console.log('✅ Usuario autenticado, cargando ventas...');
      await sales.fetchSales();
      console.log('✅ Ventas cargadas en MainNav:', sales.sales.length);
    } else {
      console.log('ℹ️ Usuario no autenticado, no se cargan ventas');
    }
    
  } catch (error) {
    console.error('❌ Error al cargar datos en MainNav:', error);
  }
});

// Estadísticas del dashboard
const dashboardStats = computed(() => {
  const totalProducts = products.allProducts.length;
  const lowStock = products.allProducts.filter(p => p.availability <= 5 && p.availability > 0).length;
  const outOfStock = products.allProducts.filter(p => p.availability === 0).length;
  
  // Manejar ventas solo si están disponibles (usuario autenticado)
  const totalSales = sales.sales ? sales.totalSales : 0;
  const pendingOrders = sales.sales ? sales.sales.filter(s => s.status === 'pending').length : 0;
  const todayOrders = sales.todaysSales ? sales.todaysSales.length : 0;
  
  console.log('📊 Dashboard Stats:', {
    totalProducts,
    lowStock,
    outOfStock,
    totalSales,
    pendingOrders,
    todayOrders
  });
  
  return {
    totalProducts,
    lowStock,
    outOfStock,
    totalSales,
    pendingOrders,
    todayOrders
  };
});

// Contador del carrito (simulado por ahora)
const cartItemCount = computed(() => {
  // Aquí podrías integrar con tu store del carrito
  return 3; // Por ahora un valor fijo
});

// Función para abrir WhatsApp
const openWhatsApp = () => {
  const phoneNumber = '+573001234567'; // Número de WhatsApp de la empresa
  const message = encodeURIComponent('Hola! Me interesa conocer más sobre los productos de MI FINQUITA 🌱');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  window.open(whatsappUrl, '_blank');
};

const toggleCartVisibility = () => {
    isCartVisible.value = !isCartVisible.value;
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
    <!-- Modern Navigation Header -->
    <nav class="bg-white/95 backdrop-blur-md shadow-lg border-b border-emerald-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo y Brand -->
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
            <Logo />
            </div>
            <div class="hidden lg:block">
              <h1 class="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              </h1>
            </div>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center space-x-6">
            <!-- Navegación para Administradores -->
            <template v-if="auth.isAdmin">
              <Link to="products" 
                    class="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <span class="font-medium">Productos</span>
              </Link>

              <Link to="sales" 
                    class="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <span class="font-medium">Ventas</span>
              </Link>

              <div class="relative group">
                <button class="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span class="font-medium">Acciones</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <div class="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[220px]">
                  <Link to="new-product" class="w-full text-left px-4 py-3 hover:bg-emerald-50 text-gray-700 flex items-center space-x-3">
                    <span class="text-lg">➕</span>
                    <span>Agregar Producto</span>
                  </Link>
                  <Link to="public-products" class="w-full text-left px-4 py-3 hover:bg-emerald-50 text-gray-700 flex items-center space-x-3">
                    <span class="text-lg">🛍️</span>
                    <span>Ver Tienda Pública</span>
                  </Link>
                  <Link to="shop" class="w-full text-left px-4 py-3 hover:bg-emerald-50 text-gray-700 flex items-center space-x-3">
                    <span class="text-lg">👨‍💼</span>
                    <span>Vista Admin</span>
                  </Link>
                </div>
              </div>
            </template>

            <!-- Navegación para Clientes -->
            <template v-else>
              <Link to="public-products" 
                    class="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <span class="font-medium">Productos</span>
              </Link>
              
              <div class="relative group">
                <button class="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span class="font-medium">Servicios</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <div class="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[200px]">
                  <div class="px-4 py-3 hover:bg-emerald-50 text-gray-700 flex items-center space-x-3 cursor-pointer" @click="openWhatsApp">
                    <span class="text-lg">📱</span>
                    <span>Contacto WhatsApp</span>
                  </div>
                  <div class="px-4 py-3 hover:bg-emerald-50 text-gray-700 flex items-center space-x-3">
                    <span class="text-lg">🚚</span>
                    <span>Consultar Entrega</span>
                  </div>
                  <div class="px-4 py-3 hover:bg-emerald-50 text-gray-700 flex items-center space-x-3">
                    <span class="text-lg">💬</span>
                    <span>Soporte Técnico</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Cart Button (para todos los usuarios autenticados) -->
            <button v-if="auth.isAuth" 
                    @click="toggleCartVisibility" 
                    class="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200">
              <FontAwesomeIcon :icon="faShoppingCart" class="w-6 h-6" />
              <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ cartItemCount }}
              </span>
            </button>

            <!-- Auth Button -->
            <div class="flex items-center space-x-3">
              <div v-if="auth.isAuth" class="flex items-center space-x-3">
                <div class="text-sm">
                  <p class="text-gray-600">Bienvenido</p>
                  <p class="font-medium text-emerald-600">{{ auth.userDisplayName }}</p>
                  <p class="text-xs text-gray-500">{{ auth.isAdmin ? '👨‍💼 Administrador' : '👤 Cliente' }}</p>
                </div>
                
                <button @click="auth.logout"
                        class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md">
                  Cerrar Sesión
                </button>
              </div>
              <button v-else @click="$router.push({ name: 'login' })"
                      class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md">
                Iniciar Sesión
              </button>
            </div>
        </div>

          <!-- Mobile menu button -->
          <div class="lg:hidden">
            <button @click="toggleMobileMenu" 
                    class="p-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <div v-show="showMobileMenu" class="lg:hidden bg-white border-t border-emerald-200">
        <div class="px-4 py-3 space-y-2">
          <!-- Navegación para Administradores -->
          <template v-if="auth.isAdmin">
            <Link to="products" class="block px-3 py-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
              📦 Productos
            </Link>
            <Link to="sales" class="block px-3 py-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
              📊 Ventas
            </Link>
            <div class="border-t border-gray-200 pt-2 mt-2">
              <p class="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones Rápidas</p>
              <Link to="new-product" class="block px-3 py-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                ➕ Agregar Producto
              </Link>
              <Link to="public-products" class="block px-3 py-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                🛍️ Ver Tienda Pública
              </Link>
              <Link to="shop" class="block px-3 py-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                👨‍💼 Vista Admin
              </Link>
            </div>
          </template>
          
          <!-- Navegación para Clientes -->
          <template v-else>
            <Link to="public-products" class="block px-3 py-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
              📦 Productos
            </Link>
            <Link to="shop" class="block px-3 py-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
              🛍️ Tienda
            </Link>
            <div class="border-t border-gray-200 pt-2 mt-2">
              <p class="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Servicios</p>
              <button @click="openWhatsApp" class="w-full text-left px-3 py-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                📱 Contacto WhatsApp
              </button>
              <div class="px-3 py-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                🚚 Consultar Entrega
              </div>
              <div class="px-3 py-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                💬 Soporte Técnico
              </div>
            </div>
          </template>
          
          <!-- Cart button for mobile -->
          <button v-if="auth.isAuth" @click="toggleCartVisibility"
                  class="w-full text-left px-3 py-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-between">
            <span>🛒 Carrito de Compras</span>
            <span class="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {{ cartItemCount }}
            </span>
          </button>
          
          <!-- Logout/Login buttons -->
          <div class="border-t border-gray-200 pt-2 mt-2">
            <button v-if="auth.isAuth" @click="auth.logout"
                    class="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors">
              🚪 Cerrar Sesión
            </button>
            <button v-else @click="$router.push({ name: 'login' })"
                    class="w-full text-left px-3 py-2 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors">
              🔑 Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Dashboard Section para Administradores -->
    <div v-if="auth.isAuth && auth.isAdmin" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Dashboard Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">📊 Panel de Control</h2>
        <p class="text-gray-600">Resumen ejecutivo de tu negocio agropecuario</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <!-- Total Productos -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Productos</p>
              <p class="text-2xl font-bold text-emerald-600">{{ dashboardStats.totalProducts }}</p>
            </div>
            <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span class="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <!-- Stock Bajo -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p class="text-2xl font-bold text-yellow-600">{{ dashboardStats.lowStock }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span class="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        <!-- Agotados -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Agotados</p>
              <p class="text-2xl font-bold text-red-600">{{ dashboardStats.outOfStock }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span class="text-2xl">❌</span>
            </div>
          </div>
        </div>

        <!-- Total Ventas -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Ventas</p>
              <p class="text-lg font-bold text-green-600">{{ formatCurrency(dashboardStats.totalSales) }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span class="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <!-- Órdenes Pendientes -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Pendientes</p>
              <p class="text-2xl font-bold text-orange-600">{{ dashboardStats.pendingOrders }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span class="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <!-- Ventas Hoy -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Ventas Hoy</p>
              <p class="text-2xl font-bold text-teal-600">{{ dashboardStats.todayOrders }}</p>
            </div>
            <div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <span class="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Filters Section -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-8 border border-emerald-100">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span class="text-2xl mr-2">🔍</span>
          Filtros de Productos
        </h3>
        
        <!-- Debug info -->
        <div v-if="!products.allProducts.length" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-sm text-yellow-700">
            ⚠️ No hay productos cargados. Total: {{ products.allProducts.length }}
          </p>
        </div>
        
        <div class="flex flex-wrap gap-4">
          <div v-for="category in products.categories" :key="category.id" 
               class="flex items-center">
            <input type="radio" 
                   name="category" 
                   :value="category.id"
                   :id="`category-${category.id}`"
                   class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                   :checked="products.selectedCategory === category.id"
                   @change="products.selectedCategory = +$event.target.value">
            <label :for="`category-${category.id}`" 
                   class="ml-2 text-sm font-medium text-gray-700 cursor-pointer hover:text-emerald-600 transition-colors">
              {{ category.name }}
            </label>
          </div>
        </div>
        
        <!-- Products summary -->
        <div v-if="products.allProducts.length > 0" class="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p class="text-sm text-emerald-700">
            📦 {{ products.allProducts.length }} productos en total | 
            ✅ {{ products.allProducts.filter(p => p.availability > 0).length }} en stock |
            ❌ {{ products.allProducts.filter(p => p.availability === 0).length }} agotados
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl shadow-lg p-6 text-white">
        <h3 class="text-xl font-bold mb-4 flex items-center">
          <span class="text-2xl mr-2">🚀</span>
          Acciones Rápidas
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="new-product" 
                class="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-center transition-all duration-200 transform hover:scale-105 shadow-md">
            <div class="text-2xl mb-2">➕</div>
            <div class="font-medium">Agregar Producto</div>
          </Link>
          
          <Link to="sales" 
                class="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-center transition-all duration-200 transform hover:scale-105 shadow-md">
            <div class="text-2xl mb-2">📋</div>
            <div class="font-medium">Ver Ventas</div>
          </Link>
          
          <Link to="public-products" 
                class="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-center transition-all duration-200 transform hover:scale-105 shadow-md">
            <div class="text-2xl mb-2">🛍️</div>
            <div class="font-medium">Ver Tienda Pública</div>
          </Link>
        </div>
      </div>
    </div>

    <!-- Sección de Bienvenida para Clientes -->
    <div v-if="auth.isAuth && auth.isUser" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Cliente Welcome Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">🌱 Bienvenido a MI FINQUITA</h2>
        <p class="text-lg text-gray-600">Explora nuestros productos agropecuarios de calidad</p>
      </div>

      <!-- Cliente Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Ir a Tienda -->
        <Link to="shop" 
              class="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 shadow-lg">
          <div class="text-4xl mb-4">🛍️</div>
          <h3 class="text-2xl font-bold mb-2">Ir a la Tienda</h3>
          <p class="text-emerald-100">Explora todos nuestros productos disponibles</p>
        </Link>

        <!-- Ver Catálogo -->
        <Link to="public-products" 
              class="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 shadow-lg">
          <div class="text-4xl mb-4">📦</div>
          <h3 class="text-2xl font-bold mb-2">Ver Catálogo</h3>
          <p class="text-teal-100">Navega por todas nuestras categorías</p>
        </Link>
      </div>

      <!-- Cliente Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-lg p-6 border border-emerald-100 text-center">
          <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🌱</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Productos de Calidad</h3>
          <p class="text-sm text-gray-600">Fertilizantes, semillas y productos agrícolas certificados</p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 border border-emerald-100 text-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🚚</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Entrega Rápida</h3>
          <p class="text-sm text-gray-600">Llevamos tus productos directamente a tu finca</p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 border border-emerald-100 text-center">
          <div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📱</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Soporte WhatsApp</h3>
          <p class="text-sm text-gray-600">Atención personalizada para tus consultas</p>
        </div>
      </div>
    </div>

    <!-- Cart Modal -->
    <div v-if="isCartVisible">
        <ListItemCartShop />
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
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Transiciones suaves */
* {
  transition: all 0.2s ease-in-out;
}

/* Backdrop blur personalizado */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
}
</style>
