import { ref, computed, onMounted, inject } from "vue";
import { defineStore } from "pinia";
import { useFirebaseAuth } from "vuefire";
import { useRouter } from "vue-router";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

export const useAuthStore = defineStore("auth", () => {
  const toast = inject("toast");
  const auth = useFirebaseAuth();
  const router = useRouter();
  const authUser = ref(null);
  const userData = ref(null);
  const db = getFirestore();
  const errorMsg = ref("");

  const errorCodes = {
    "auth/user-not-found": "Usuario no encontrado",
    "auth/wrong-password": "El password es incorrecto",
    "auth/invalid-credential": "Credenciales Invalidas",
    "auth/email-already-in-use": "El email ya está en uso",
    "auth/weak-password": "La contraseña es demasiado débil",
  };

  onMounted(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        authUser.value = user;
        console.log('🔄 Usuario autenticado, obteniendo datos...');
        
        // Obtener datos del usuario desde Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          userData.value = { 
            uid: user.uid,
            email: user.email,
            ...userDoc.data() 
          };
          console.log('✅ Datos de usuario cargados:', userData.value);
        } else {
          console.warn('⚠️ No se encontraron datos de usuario en Firestore');
          userData.value = null;
        }
      } else {
        authUser.value = null;
        userData.value = null;
        console.log('👤 Usuario no autenticado');
      }
    });
  });

  const login = async ({ email, password }) => {
    try {
      console.log("🔄 Iniciando login para:", email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      authUser.value = user;
      console.log("✅ Usuario autenticado:", user.uid);
      
      console.log("🔄 Obteniendo rol desde Firestore...");
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userInfo = userDoc.data();
        userData.value = { 
          uid: user.uid,
          email: user.email,
          ...userInfo 
        };
        
        console.log("✅ Rol obtenido:", userInfo.role);
        
        // Redirección basada en rol
        if (userInfo.role === "admin") {
          console.log("🔄 Redirigiendo a admin dashboard...");
          router.push({ name: "products" });
          toast.open({
            message: `¡Bienvenido Admin! ${user.email}`,
            type: "success",
          });
        } else {
          console.log("🔄 Redirigiendo a tienda pública...");
          router.push({ name: "public-products" });
          toast.open({
            message: `¡Bienvenido! ${userInfo.displayName || user.email}`,
            type: "success",
          });
        }
      } else {
        console.warn("⚠️ No se encontró documento de usuario en Firestore");
        toast.open({
          message: "Error al obtener información del usuario",
          type: "error",
        });
        // Si no hay datos en Firestore, crear documento básico como user
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "user",
          createdAt: new Date(),
          displayName: user.email.split('@')[0]
        });
        userData.value = {
          uid: user.uid,
          email: user.email,
          role: "user",
          displayName: user.email.split('@')[0]
        };
        router.push({ name: "public-products" });
      }
    } catch (error) {
      console.error("❌ Error en login:", error.code, error.message);
      if (error.code === "permission-denied") {
        toast.open({
          message: "Error: No tienes permisos para acceder a los datos",
          type: "error",
        });
      } else {
        toast.open({
          message: errorCodes[error.code] || "Credenciales Invalidas",
          type: "error",
        });
      }
    }
  };

  const register = async ({ email, password }) => {
    try {
      console.log("🔄 Iniciando registro para:", email);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      authUser.value = user;
      console.log("✅ Usuario creado en Authentication:", user.uid);

      console.log("🔄 Guardando información de usuario en Firestore...");
      
      // SIEMPRE crear como "user" (cliente) por defecto
      // Solo permitir admin mediante función especial
      const role = "user";
      const displayName = email.split('@')[0]; // Usar parte del email como nombre display
      
      const userInfo = {
        email: email,
        role: role,
        displayName: displayName,
        createdAt: new Date(),
        isActive: true
      };
      
      await setDoc(doc(db, "users", user.uid), userInfo);
      console.log("✅ Información de usuario guardada en Firestore:", userInfo);

      userData.value = {
        uid: user.uid,
        ...userInfo
      };

      toast.open({
        message: `🎉 ¡Registro exitoso! Bienvenido ${displayName}`,
        type: "success",
      });

      console.log("🔄 Redirigiendo al login...");
      router.push({ name: "login" });
    } catch (error) {
      console.error("❌ Error en registro:", error.code, error.message);
      if (error.code === "permission-denied") {
        toast.open({
          message: "Error: Firestore no está configurado correctamente",
          type: "error",
        });
      } else {
        toast.open({
          message: errorCodes[error.code] || "Error en el registro",
          type: "error",
        });
      }
    }
  };

  const logout = () => {
    console.log("🔄 Cerrando sesión...");
    signOut(auth)
      .then(() => {
        authUser.value = null;
        userData.value = null;
        console.log("✅ Sesión cerrada");
        router.push({ name: "login" });
        toast.open({
          message: "Sesión cerrada correctamente",
          type: "success",
        });
      })
      .catch((error) => {
        console.error("❌ Error al cerrar sesión:", error);
      });
  };

  // Getters computados
  const hasError = computed(() => {
    return errorMsg.value;
  });

  const isAuth = computed(() => {
    return authUser.value !== null;
  });

  const isAdmin = computed(() => {
    return userData.value?.role === "admin";
  });

  const isUser = computed(() => {
    return userData.value?.role === "user";
  });

  const userDisplayName = computed(() => {
    return userData.value?.displayName || userData.value?.email?.split('@')[0] || 'Usuario';
  });

  return {
    // Auth methods
    login,
    register,
    logout,
    
    // State
    authUser,
    userData,
    hasError,
    errorMsg,
    
    // Computed
    isAuth,
    isAdmin,
    isUser,
    userDisplayName,
  };
});
