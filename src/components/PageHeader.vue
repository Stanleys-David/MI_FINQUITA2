<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  customBackRoute: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '📄'
  }
});

// Mapeo de rutas a nombres legibles y rutas padre
const routeMap = {
  'shop': { 
    name: 'Tienda Principal', 
    parent: null,
    icon: '🛍️'
  },
  'public-products': { 
    name: 'Catálogo de Productos', 
    parent: 'shop',
    icon: '📦'
  },
  'products': { 
    name: 'Gestión de Productos', 
    parent: null,
    icon: '📦'
  },
  'sales': { 
    name: 'Reportes de Ventas', 
    parent: 'products',
    icon: '📊'
  },
  'new-product': { 
    name: 'Nuevo Producto', 
    parent: 'products',
    icon: '➕'
  },
  'edit-product': { 
    name: 'Editar Producto', 
    parent: 'products',
    icon: '✏️'
  },
  'cart': { 
    name: 'Carrito de Compras', 
    parent: 'public-products',
    icon: '🛒'
  },
  'login': { 
    name: 'Iniciar Sesión', 
    parent: null,
    icon: '🔑'
  },
  'Register': { 
    name: 'Registrarse', 
    parent: 'login',
    icon: '📝'
  }
};

const currentRoute = computed(() => routeMap[route.name] || { name: route.name, parent: null, icon: '📄' });

const breadcrumbs = computed(() => {
  const crumbs = [];
  let current = currentRoute.value;
  
  // Construir breadcrumbs desde la ruta actual hacia arriba
  while (current) {
    crumbs.unshift({
      name: current.name,
      route: Object.keys(routeMap).find(key => routeMap[key] === current),
      icon: current.icon
    });
    
    if (current.parent) {
      current = routeMap[current.parent];
    } else {
      break;
    }
  }
  
  return crumbs;
});

const goBack = () => {
  if (props.customBackRoute) {
    router.push({ name: props.customBackRoute });
  } else if (route.meta?.parent) {
    router.push({ name: route.meta.parent });
  } else if (currentRoute.value.parent) {
    router.push({ name: currentRoute.value.parent });
  } else {
    router.back();
  }
};

const goToRoute = (routeName) => {
  if (routeName && routeName !== route.name) {
    router.push({ name: routeName });
  }
};
</script>

<template>
  <div class="bg-white border-b border-emerald-100 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-6">
        <!-- Breadcrumbs -->
        <nav class="flex items-center space-x-2 text-sm mb-4" aria-label="Breadcrumb">
          <div v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center">
            <button v-if="crumb.route && crumb.route !== route.name"
                    @click="goToRoute(crumb.route)"
                    class="flex items-center space-x-1 text-gray-500 hover:text-emerald-600 transition-colors">
              <span>{{ crumb.icon }}</span>
              <span>{{ crumb.name }}</span>
            </button>
            <span v-else class="flex items-center space-x-1 text-emerald-600 font-medium">
              <span>{{ crumb.icon }}</span>
              <span>{{ crumb.name }}</span>
            </span>
            
            <svg v-if="index < breadcrumbs.length - 1" 
                 class="w-4 h-4 text-gray-400 mx-2" 
                 fill="none" 
                 stroke="currentColor" 
                 viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </nav>

        <!-- Header Content -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- Back Button -->
            <button v-if="showBackButton" 
                    @click="goBack"
                    class="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all duration-200 transform hover:scale-105">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span class="font-medium">Regresar</span>
            </button>

            <!-- Page Title -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <span class="text-3xl">{{ icon }}</span>
                <span>{{ title }}</span>
              </h1>
              <p v-if="subtitle" class="text-lg text-gray-600 mt-1">{{ subtitle }}</p>
            </div>
          </div>

          <!-- User Info (solo si está autenticado) -->
          <div v-if="auth.isAuth" class="flex items-center space-x-3">
            <div class="text-right">
              <p class="text-sm text-gray-500">{{ auth.isAdmin ? '👨‍💼 Panel de Admin' : '👤 Portal de Cliente' }}</p>
              <p class="font-medium text-emerald-600">{{ auth.userDisplayName }}</p>
            </div>
            <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span class="text-lg">{{ auth.isAdmin ? '👨‍💼' : '👤' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animaciones para el botón de regresar */
button:hover {
  transform: translateX(-2px);
}

/* Efecto de hover para breadcrumbs */
nav button:hover {
  transform: translateY(-1px);
}
</style> 