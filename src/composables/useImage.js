import { ref, computed } from "vue";
import { supabase } from '@/config/firebase';
import { uid } from "uid";

export default function useImage() {
  const url = ref("");
  const uploading = ref(false);
  const uploadProgress = ref(0);

  // Función para verificar si el bucket existe
  const checkBucketExists = async (bucketName) => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error("❌ Error al listar buckets:", error);
        return false;
5      }
      
      console.log("📦 Buckets disponibles:", data.map(b => b.name));
      const bucketExists = data.some(bucket => bucket.name === bucketName);
      console.log(`🔍 Bucket '${bucketName}' ${bucketExists ? '✅ existe' : '❌ no existe'}`);
      
      return bucketExists;
    } catch (error) {
      console.error("❌ Error al verificar buckets:", error);
      return false;
    }
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    uploading.value = true;
    uploadProgress.value = 0;

    try {
      const bucketName = 'product-images';
      
      // Verificar que el bucket existe (pero no fallar si la verificación falla)
      console.log("🔍 Verificando que el bucket existe...");
      try {
        const bucketExists = await checkBucketExists(bucketName);
        if (!bucketExists) {
          console.warn("⚠️ No se pudo verificar la existencia del bucket, pero continuando con la subida...");
        }
      } catch (checkError) {
        console.warn("⚠️ Error al verificar bucket, pero continuando con la subida:", checkError);
      }

      // Generar nombre único para el archivo
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const filename = `${uid()}.${fileExtension}`;
      const filePath = `products/${filename}`;

      console.log("🔄 Subiendo imagen a Supabase...", filename);
      console.log("📁 Bucket:", bucketName);
      console.log("📄 Archivo:", file.name, "Tamaño:", (file.size / 1024 / 1024).toFixed(2), "MB");
      console.log("🛤️ Ruta completa:", filePath);

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      console.log("📊 Respuesta de Supabase:", { data, error });

      if (error) {
        console.error("❌ Error detallado al subir imagen:");
        console.error("- Código:", error.statusCode);
        console.error("- Mensaje:", error.message);
        console.error("- Error completo:", error);
        throw error;
      }

      console.log("✅ Imagen subida exitosamente:", data.path);

      // Obtener URL pública del archivo
      console.log("🔗 Generando URL pública...");
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log("📊 Datos de URL:", urlData);
      
      url.value = urlData.publicUrl;
      console.log("🔗 URL pública generada:", url.value);

    } catch (error) {
      console.error("❌ Error COMPLETO en onFileChange:");
      console.error("- Tipo:", typeof error);
      console.error("- Mensaje:", error.message);
      console.error("- Stack:", error.stack);
      console.error("- Objeto completo:", error);
      
      url.value = "";
      
      // Mostrar error más específico al usuario
      if (error.message && error.message.includes('Bucket not found')) {
        alert(`Error: El bucket 'product-images' no existe.\n\n1. Ve a Supabase Dashboard\n2. Storage → New bucket\n3. Nombre: product-images\n4. Marca como público\n5. Ejecuta las políticas SQL`);
      } else if (error.message && error.message.includes('policy')) {
        alert(`Error de permisos: ${error.message}\n\nVerifica las políticas del bucket en Supabase usando el script SQL.`);
      } else {
        alert(`Error al subir imagen: ${error.message || 'Error desconocido'}\n\nRevisar la consola para más detalles.`);
      }
    } finally {
      uploading.value = false;
      uploadProgress.value = 100;
    }
  };

  const deleteImage = async (imagePath) => {
    try {
      const bucketName = 'product-images';
      
      console.log("🗑️ Eliminando imagen:", imagePath);
      
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([imagePath]);

      if (error) {
        console.error("❌ Error al eliminar imagen:", error);
        return false;
      }

      console.log("✅ Imagen eliminada exitosamente");
      return true;
    } catch (error) {
      console.error("❌ Error al eliminar imagen:", error);
      return false;
    }
  };

  const isImageUploaded = computed(() => {
    return url.value ? url.value : null;
  });

  const isUploading = computed(() => uploading.value);

  return {
    url,
    onFileChange,
    isImageUploaded,
    isUploading,
    uploadProgress,
    deleteImage,
    checkBucketExists,
  };
}
