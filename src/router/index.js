import { createRouter, createWebHistory } from "vue-router";
import ShopView from "@/views/ShopView.vue";
import AdminLayout from "@/views/admin/AdminLayout.vue";
import { onAuthStateChanged } from "firebase/auth";
import { useFirebaseAuth } from "vuefire";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Checkout from "../views/admin/Checkout.vue";
import NotFound from "@/views/NotFound.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "shop",
      component: ShopView,
    },
    {
      path: "/products",
      name: "public-products",
      component: () => import("@/views/PublicProductsView.vue"),
    },
    {
      path: "/checkout",
      name: "check",
      component: Checkout,
      children: [
        {
          path: "carrito-de-compras",
          name: "cart",
          component: () => import("@/components/ShoppingCart.vue"),
        },
      ],
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
    },
    {
      path: "/Register",
      name: "Register",
      component: () => import("@/views/Register.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: AdminLayout,
      children: [
        {
          path: "productos",
          name: "products",
          component: () => import("../views/admin/ProductsView.vue"),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: "ventas",
          name: "sales",
          component: () => import("../views/admin/SalesView.vue"),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: "productos/nuevo",
          name: "new-product",
          component: () => import("../views/admin/NewProductView.vue"),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: "productos/editar/:id",
          name: "edit-product",
          component: () => import("../views/admin/EditProductView.vue"),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: "productos/seeder",
          name: "seed-products",
          component: () => import("../views/admin/SeederView.vue"),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFound,
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((url) => url.meta.requiresAuth);
  const requiresAdmin = to.matched.some((url) => url.meta.requiresAdmin);
  
  if (requiresAuth) {
    try {
      console.log('🔐 Verificando autenticación para ruta:', to.name);
      const { user, userData } = await authenticateUser();
      
      if (requiresAdmin) {
        console.log('👨‍💼 Verificando permisos de admin...');
        if (userData?.role !== 'admin') {
          console.log('❌ Acceso denegado: Usuario no es admin');
          next({ 
            name: "public-products",
            query: { 
              error: 'admin_required',
              message: 'Esta sección es solo para administradores. ¡Explora nuestros productos!'
            }
          });
          return;
        }
        console.log('✅ Usuario admin verificado');
      }
      
      console.log('✅ Acceso autorizado a ruta:', to.name);
      next();
    } catch (error) {
      console.log("❌ Autenticación fallida, redirigiendo al login:", error);
      next({ 
        name: "login",
        query: { 
          redirect: to.fullPath,
          error: 'auth_required',
          message: 'Debes iniciar sesión para acceder a esta página'
        }
      });
    }
  } else {
    next();
  }
});

function authenticateUser() {
  return new Promise((resolve, reject) => {
    try {
      const auth = useFirebaseAuth();
      if (!auth) {
        console.log("Firebase Auth not initialized yet");
        reject("Firebase Auth not ready");
        return;
      }
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          try {
            console.log('🔄 Usuario autenticado, obteniendo datos de Firestore...');
            const db = getFirestore();
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log('✅ Datos de usuario obtenidos:', userData.role);
              resolve({ user, userData });
            } else {
              console.log('⚠️ No se encontraron datos de usuario en Firestore');
              // Si no hay datos, crear usuario básico
              const basicUserData = { role: 'user', email: user.email };
              resolve({ user, userData: basicUserData });
            }
          } catch (error) {
            console.error('❌ Error obteniendo datos de usuario:', error);
            reject("Error getting user data");
          }
        } else {
          reject("No user authenticated");
        }
      });
    } catch (error) {
      console.error("Error in authenticateUser:", error);
      reject(error);
    }
  });
}

export default router;
