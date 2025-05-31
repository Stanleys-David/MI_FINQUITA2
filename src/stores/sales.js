import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDoc
} from "firebase/firestore";
import { useFirestore } from "vuefire";

export const useSalesStore = defineStore("sales", () => {
  const db = useFirestore();
  const sales = ref([]);
  const loading = ref(false);

  // Computed
  const totalSales = computed(() => 
    sales.value.reduce((sum, sale) => sum + sale.total, 0)
  );

  const todaysSales = computed(() => {
    const today = new Date().toDateString();
    return sales.value.filter(sale => 
      new Date(sale.createdAt?.toDate?.() || sale.createdAt).toDateString() === today
    );
  });

  const recentSales = computed(() => 
    sales.value.slice(0, 10)
  );

  // Función para actualizar inventario de productos
  const updateProductInventory = async (items) => {
    try {
      console.log('🔄 INICIANDO actualización de inventario de productos...');
      console.log('📦 Items a procesar:', items);
      console.log('📊 Total de items:', items.length);
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`\n🔄 Procesando item ${i + 1}/${items.length}:`);
        console.log(`📝 Nombre: ${item.name}`);
        console.log(`🆔 Product ID: ${item.productId}`);
        console.log(`📊 Cantidad a descontar: ${item.quantity}`);
        
        const productRef = doc(db, "products", item.productId);
        console.log(`🔗 Referencia del producto creada: products/${item.productId}`);
        
        const productSnap = await getDoc(productRef);
        console.log(`📄 Documento obtenido, existe: ${productSnap.exists()}`);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          const currentStock = productData.availability || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          
          console.log(`📊 Stock ANTES: ${currentStock}`);
          console.log(`📊 Descontando: ${item.quantity}`);
          console.log(`📊 Stock DESPUÉS: ${newStock}`);
          
          await updateDoc(productRef, {
            availability: newStock,
            updatedAt: serverTimestamp()
          });
          
          console.log(`✅ Inventario actualizado exitosamente para ${item.name}`);
        } else {
          console.error(`❌ Producto NO ENCONTRADO: ${item.productId}`);
          throw new Error(`⚠️ Producto no encontrado: ${item.productId}`);
        }
      }
      
      console.log('✅ INVENTARIO ACTUALIZADO COMPLETAMENTE - TODOS LOS PRODUCTOS PROCESADOS');
    } catch (error) {
      console.error('❌ ERROR CRÍTICO al actualizar inventario:', error);
      console.error('❌ Stack trace:', error.stack);
      throw error;
    }
  };

  // Función para restaurar inventario de productos (cuando se cancela una venta)
  const restoreProductInventory = async (items) => {
    try {
      console.log('🔄 Restaurando inventario de productos...');
      
      for (const item of items) {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          const currentStock = productData.availability || 0;
          const newStock = currentStock + item.quantity;
          
          console.log(`📦 Producto: ${item.name}`);
          console.log(`📊 Stock actual: ${currentStock}, Restaurando: ${item.quantity}, Nuevo stock: ${newStock}`);
          
          await updateDoc(productRef, {
            availability: newStock,
            updatedAt: serverTimestamp()
          });
          
          console.log(`✅ Inventario restaurado para ${item.name}`);
        } else {
          console.warn(`⚠️ Producto no encontrado: ${item.productId}`);
        }
      }
      
      console.log('✅ Inventario restaurado completamente');
    } catch (error) {
      console.error('❌ Error al restaurar inventario:', error);
      throw error;
    }
  };

  // Actions
  const createSale = async (saleData) => {
    try {
      loading.value = true;
      
      // Validar datos antes de enviar
      if (!saleData || typeof saleData !== 'object') {
        throw new Error('Datos de venta inválidos');
      }
      
      if (!saleData.customer?.name || !saleData.customer?.phone) {
        throw new Error('Información del cliente incompleta');
      }
      
      if (!saleData.items || !Array.isArray(saleData.items) || saleData.items.length === 0) {
        throw new Error('No hay productos en la venta');
      }
      
      if (!saleData.total || saleData.total <= 0) {
        throw new Error('Total de venta inválido');
      }
      
      console.log('🔄 Creando venta con datos:', saleData);
      
      const sale = {
        ...saleData,
        status: "pending", // pending, confirmed, delivered, cancelled
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Crear la venta en la base de datos (SIN descontar inventario)
      const docRef = await addDoc(collection(db, "sales"), sale);
      
      // Agregar el sale al array local con el ID
      const newSale = {
        id: docRef.id,
        ...sale,
        createdAt: new Date() // Para mostrar inmediatamente
      };
      
      sales.value.unshift(newSale);
      
      console.log('✅ Venta creada exitosamente con ID:', docRef.id);
      console.log('📋 El inventario se descontará cuando se marque como "Entregado"');
      
      return docRef.id;
    } catch (error) {
      console.error("❌ Error al crear venta:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchSales = async () => {
    try {
      loading.value = true;
      
      const q = query(
        collection(db, "sales"),
        orderBy("createdAt", "desc"),
        limit(50) // Limitar a 50 ventas más recientes
      );
      
      const querySnapshot = await getDocs(q);
      
      sales.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
    } catch (error) {
      console.error("Error al obtener ventas:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateSaleStatus = async (saleId, newStatus) => {
    try {
      console.log('🔄 Iniciando actualización de estado de venta...');
      console.log('📝 Sale ID:', saleId);
      console.log('📝 Nuevo estado:', newStatus);
      
      // Obtener la venta actual para acceder a los items
      const sale = getSaleById(saleId);
      console.log('🔍 Venta encontrada:', sale);
      
      if (!sale) {
        throw new Error('Venta no encontrada');
      }
      
      const previousStatus = sale.status;
      console.log('📝 Estado anterior:', previousStatus);
      console.log('📝 Estado nuevo:', newStatus);
      
      const saleRef = doc(db, "sales", saleId);
      
      await updateDoc(saleRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Documento de venta actualizado en Firebase');

      // Manejar cambios de inventario según el estado
      if (previousStatus !== 'delivered' && newStatus === 'delivered') {
        console.log('🚚 CONDICIÓN CUMPLIDA: Marcando como entregado, descontando inventario...');
        console.log('📦 Items a procesar:', sale.items);
        
        // Verificar stock disponible antes de descontar
        for (const item of sale.items) {
          console.log(`🔍 Verificando stock para producto: ${item.name} (ID: ${item.productId})`);
          
          const productRef = doc(db, "products", item.productId);
          const productSnap = await getDoc(productRef);
          
          if (productSnap.exists()) {
            const productData = productSnap.data();
            const currentStock = productData.availability || 0;
            
            console.log(`📊 Stock actual de ${item.name}: ${currentStock}`);
            console.log(`📊 Cantidad a descontar: ${item.quantity}`);
            
            if (currentStock < item.quantity) {
              throw new Error(`Stock insuficiente para entregar. ${item.name}: Disponible: ${currentStock}, Necesario: ${item.quantity}`);
            }
          } else {
            throw new Error(`Producto no encontrado: ${item.name} (ID: ${item.productId})`);
          }
        }
        
        console.log('✅ Verificación de stock completada, procediendo a descontar...');
        await updateProductInventory(sale.items);
        console.log('✅ Inventario descontado correctamente');
        
      } else if (previousStatus === 'delivered' && newStatus !== 'delivered') {
        console.log('🔄 CONDICIÓN CUMPLIDA: Cambiando de entregado a otro estado, restaurando inventario...');
        await restoreProductInventory(sale.items);
        console.log('✅ Inventario restaurado correctamente');
        
      } else if (previousStatus !== 'cancelled' && newStatus === 'cancelled') {
        if (previousStatus === 'delivered') {
          console.log('❌ CONDICIÓN CUMPLIDA: Cancelando venta entregada, restaurando inventario...');
          await restoreProductInventory(sale.items);
          console.log('✅ Inventario restaurado por cancelación');
        } else {
          console.log('❌ Cancelando venta no entregada, sin cambios de inventario');
        }
        
      } else if (previousStatus === 'cancelled' && newStatus === 'delivered') {
        console.log('🔄 CONDICIÓN CUMPLIDA: Reactivando venta cancelada como entregada, descontando inventario...');
        
        // Verificar stock disponible
        for (const item of sale.items) {
          const productRef = doc(db, "products", item.productId);
          const productSnap = await getDoc(productRef);
          
          if (productSnap.exists()) {
            const productData = productSnap.data();
            const currentStock = productData.availability || 0;
            
            if (currentStock < item.quantity) {
              throw new Error(`Stock insuficiente para entregar la venta reactivada. ${item.name}: Disponible: ${currentStock}, Necesario: ${item.quantity}`);
            }
          }
        }
        
        await updateProductInventory(sale.items);
        console.log('✅ Inventario descontado por reactivación');
      } else {
        console.log('ℹ️ No se requieren cambios de inventario para este cambio de estado');
        console.log(`ℹ️ De ${previousStatus} a ${newStatus}`);
      }

      // Actualizar en el array local
      const saleIndex = sales.value.findIndex(sale => sale.id === saleId);
      if (saleIndex !== -1) {
        sales.value[saleIndex].status = newStatus;
        sales.value[saleIndex].updatedAt = new Date();
      }

      console.log(`✅ Estado de venta actualizado de ${previousStatus} a ${newStatus}`);

    } catch (error) {
      console.error("❌ Error al actualizar estado de venta:", error);
      throw error;
    }
  };

  const getSaleById = (saleId) => {
    return sales.value.find(sale => sale.id === saleId);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      delivered: "Entregado",
      cancelled: "Cancelado"
    };
    return texts[status] || "Desconocido";
  };

  return {
    // State
    sales,
    loading,
    
    // Getters
    totalSales,
    todaysSales,
    recentSales,
    
    // Actions
    createSale,
    fetchSales,
    updateSaleStatus,
    getSaleById,
    getStatusColor,
    getStatusText
  };
});
