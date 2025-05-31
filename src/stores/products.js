import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useFirestore } from "vuefire";
import {
  collection,
  addDoc,
  where,
  query,
  limit,
  orderBy,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
  getDocs
} from "firebase/firestore";
import { supabase } from '@/config/firebase';
import { inject } from "vue";

export const useProductsStore = defineStore("products", () => {
  const swal = inject("$swal");
  const db = useFirestore();

  const selectedCategory = ref(0);
  const productsCollection = ref([]);
  const loading = ref(false);

  const categories = [
    { id: 0, name: "TODOS" },
    { id: 1, name: "FERTILIZANTES" },
    { id: 2, name: "MAQUINAS" },
    { id: 3, name: "INSECTICIDAS" },
    { id: 4, name: "VITAMINAS" },
  ];

  // Función para cargar productos manualmente
  const loadProducts = async () => {
    try {
      loading.value = true;
      console.log('🔄 Cargando productos desde Firebase...');
      
      const q = query(collection(db, "products"), orderBy("availability", "asc"));
      const querySnapshot = await getDocs(q);
      
      productsCollection.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const product = {
          id: doc.id, // ✅ Agregar explícitamente el ID del documento
          ...data
        };
        console.log('✅ Producto cargado:', product.name, 'ID:', product.id);
        return product;
      });
      
      console.log('✅ Total productos cargados:', productsCollection.value.length);
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
    } finally {
      loading.value = false;
    }
  };

  const filterProducts = computed(() => {
    if (selectedCategory.value === 0)
      return productsCollection.value.filter(
        (product) => product.availability > 0
      );

    return productsCollection.value
      .filter((product) => product.category === selectedCategory.value)
      .filter((product) => product.availability > 0);
  });

  const allProducts = computed(() => {
    console.log("📦 Total productos en base de datos:", productsCollection.value.length);
    productsCollection.value.forEach((product, index) => {
      console.log(`📝 Producto ${index}:`, product.name, "Stock:", product.availability, "ID:", product.id);
    });
    return productsCollection.value;
  });

  async function createProduct(product) {
    console.log("🔄 Creando producto:", product);
    await addDoc(collection(db, "products"), product);
    console.log("✅ Producto creado exitosamente");
    
    // Recargar productos para que aparezca el nuevo
    await loadProducts();
    
    swal.fire({
      icon: "success",
      title: "Producto Agregado correctamente",
      showConfirmButton: false,
      timer: 1500,
    });
  }

  async function updateProduct(docRef, product) {
    const { image, url, ...values } = product;
    if (image.length) {
      await updateDoc(docRef, {
        ...values,
        image: url.value,
      });
      swal.fire({
        icon: "success",
        title: "Producto Actualizado correctamente",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      await updateDoc(docRef, values);
    }
  }

  const categoryOptions = computed(() => {
    const options = [
      { label: "Seleccione", value: "", attrs: { disabled: true } },
      ...categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    ];
    return options;
  });

  async function deleteProduct(id) {
    if (confirm("¿Eliminar Producto?")) {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        const productData = docSnap.data();
        
        console.log("🔄 Eliminando producto:", productData.name);

        // Eliminar imagen de Supabase Storage si existe
        if (productData.image) {
          // Extraer el path de la imagen desde la URL
          const imagePath = extractImagePathFromUrl(productData.image);
          if (imagePath) {
            console.log("🔄 Eliminando imagen de Supabase:", imagePath);
            const { error } = await supabase.storage
              .from('product-images')
              .remove([imagePath]);
            
            if (error) {
              console.warn("⚠️ Error al eliminar imagen de Supabase:", error.message);
            } else {
              console.log("✅ Imagen eliminada de Supabase");
            }
          }
        }

        // Eliminar documento de Firestore
        await deleteDoc(docRef);
        
        // Recargar productos para actualizar la lista
        await loadProducts();
        
        console.log("✅ Producto eliminado completamente");
        swal.fire({
          icon: "success",
          title: "Producto Eliminado correctamente",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        console.error("❌ Error al eliminar producto:", error);
        swal.fire({
          icon: "error",
          title: "Error al eliminar el producto",
          text: error.message,
        });
      }
    }
  }

  // Función auxiliar para extraer el path de la imagen desde la URL de Supabase
  function extractImagePathFromUrl(imageUrl) {
    try {
      // Las URLs de Supabase tienen el formato: 
      // https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      // Buscar la parte después de 'public' y el bucket
      const publicIndex = pathParts.indexOf('public');
      const bucketIndex = pathParts.indexOf('product-images');
      
      if (publicIndex !== -1 && bucketIndex !== -1 && bucketIndex > publicIndex) {
        return pathParts.slice(bucketIndex + 1).join('/');
      }
      return null;
    } catch (error) {
      console.error("Error al extraer path de imagen:", error);
      return null;
    }
  }

  const noResults = computed(() => productsCollection.value.length === 0);

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    productsCollection,
    categories,
    selectedCategory,
    categoryOptions,
    noResults,
    filterProducts,
    allProducts,
    loadProducts,
    loading,
  };
});
