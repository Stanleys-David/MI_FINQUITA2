import { initializeApp } from "firebase/app";
import { createClient } from '@supabase/supabase-js';

const firebaseConfig = {
  apiKey: "AIzaSyBzTQtshZH97J6EPgHPbKXRlwWRUMpWz1E",
  authDomain: "mifinquita-3f018.firebaseapp.com",
  projectId: "mifinquita-3f018",
  storageBucket: "mifinquita-3f018.firebasestorage.app",
  messagingSenderId: "542316947475",
  appId: "1:542316947475:web:6a60310faa1e4781cd37e6",
  measurementId: "G-TDBLMYTSWF"
};

// Configuración de Supabase
const supabaseUrl = 'https://hyhclgobdgrgpjyzeqiz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5aGNsZ29iZGdyZ3BqeXplcWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTExMzUsImV4cCI6MjA1OTU2NzEzNX0._CbHbsbrNEq0NSRBZBoUlU9Jbb9cGrfW4Xuu0_uMrkA';

// Debug: verificar la configuración
console.log("🔧 Firebase Config Debug:");
console.log("API Key:", firebaseConfig.apiKey ? "✅ Loaded" : "❌ Missing");
console.log("Auth Domain:", firebaseConfig.authDomain ? "✅ Loaded" : "❌ Missing");
console.log("Project ID:", firebaseConfig.projectId ? "✅ Loaded" : "❌ Missing");

console.log("🔧 Supabase Config Debug:");
console.log("URL:", supabaseUrl ? "✅ Loaded" : "❌ Missing");
console.log("Key:", supabaseKey ? "✅ Loaded" : "❌ Missing");

export const firebaseApp = initializeApp(firebaseConfig);
export const supabase = createClient(supabaseUrl, supabaseKey);

// Verificar conexión a Supabase
const testSupabaseConnection = async () => {
  try {
    console.log("🔍 Probando conexión a Supabase...");
    console.log("🔗 URL:", supabaseUrl);
    console.log("🔑 Key (primeros 10 caracteres):", supabaseKey.substring(0, 10) + "...");
    
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("❌ Error de conexión a Supabase:");
      console.error("- Código de estado:", error.statusCode);
      console.error("- Mensaje:", error.message);
      console.error("- Error completo:", error);
      
      if (error.message.includes('Invalid API key')) {
        console.error("🚨 PROBLEMA: API Key de Supabase inválida");
      } else if (error.message.includes('Project not found')) {
        console.error("🚨 PROBLEMA: Proyecto de Supabase no encontrado");
      }
      return;
    }
    
    console.log("✅ Conexión a Supabase exitosa");
    console.log("📦 Buckets encontrados:", data.map(b => `${b.name} (${b.public ? 'público' : 'privado'})`));
    
    // Verificar bucket específico
    const productImagesBucket = data.find(b => b.name === 'product-images');
    if (productImagesBucket) {
      console.log("✅ Bucket 'product-images' encontrado:", {
        name: productImagesBucket.name,
        public: productImagesBucket.public,
        created: productImagesBucket.created_at
      });
      
      // Probar permisos del bucket
      try {
        console.log("🔍 Probando permisos del bucket...");
        const { data: testData, error: testError } = await supabase.storage
          .from('product-images')
          .list('', { limit: 1 });
          
        if (testError) {
          console.warn("⚠️ Error al probar permisos del bucket:", testError.message);
          if (testError.message.includes('policy')) {
            console.error("🚨 PROBLEMA: Faltan políticas de seguridad en el bucket");
          }
        } else {
          console.log("✅ Permisos del bucket funcionando correctamente");
        }
      } catch (permError) {
        console.warn("⚠️ No se pudieron probar los permisos:", permError);
      }
      
    } else {
      console.warn("⚠️ Bucket 'product-images' no encontrado");
      console.warn("📝 Buckets disponibles:", data.map(b => b.name));
      console.warn("🔧 Necesitas crear el bucket 'product-images' manualmente");
    }
    
  } catch (error) {
    console.error("❌ Error crítico al verificar conexión a Supabase:");
    console.error("- Tipo de error:", error.constructor.name);
    console.error("- Mensaje:", error.message);
    console.error("- Stack:", error.stack);
    
    if (error.message.includes('fetch')) {
      console.error("🚨 PROBLEMA: Error de red o URL incorrecta");
    }
  }
};

// Ejecutar verificación después de un breve delay
setTimeout(testSupabaseConnection, 1000);
