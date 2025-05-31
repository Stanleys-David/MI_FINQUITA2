# 🌱 MI FINQUITA - Sistema de Punto de Venta

**MI FINQUITA** es una aplicación web moderna de punto de venta (POS) diseñada específicamente para tiendas agropecuarias. Permite gestionar productos, ventas, inventario y usuarios de manera eficiente.

## 🚀 Características Principales

### 🔐 **Sistema de Autenticación**
- Registro y login de usuarios
- Roles diferenciados (Admin/Usuario)
- Autenticación segura con Firebase Auth

### 🛍️ **Tienda Virtual**
- Catálogo de productos por categorías
- Carrito de compras interactivo
- Proceso de checkout simplificado
- Filtrado por categorías

### 👥 **Panel de Administración**
- Gestión completa de productos (CRUD)
- Control de inventario
- Reportes de ventas por fecha
- Dashboard administrativo

### 📊 **Categorías de Productos**
- **Fertilizantes** - Nutrientes para cultivos
- **Máquinas** - Herramientas y equipos agrícolas
- **Insecticidas** - Control de plagas
- **Vitaminas** - Suplementos para cultivos

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Vue 3 + Vite
- **Base de Datos:** Firebase Firestore
- **Autenticación:** Firebase Auth
- **Almacenamiento:** Firebase Storage
- **Estilos:** Tailwind CSS
- **Estado:** Pinia
- **Formularios:** FormKit
- **Notificaciones:** Vue Toast + SweetAlert2

## 📋 Requisitos Previos

1. **Node.js** (versión 16 o superior)
2. **npm** o **pnpm**
3. **Proyecto Firebase** configurado

## ⚙️ Instalación

### 1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd MI_FINQUITA2
```

### 2. **Instalar dependencias**
```bash
npm install
# o
pnpm install
```

### 3. **Configurar Firebase**

#### a) Crear archivo `.env`
Crea un archivo `.env` en la raíz del proyecto:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

#### b) Configurar servicios Firebase
1. **Authentication:**
   - Habilitar método Email/Password
2. **Firestore Database:**
   - Crear en modo test
   - Configurar reglas de seguridad
3. **Storage:**
   - Habilitar para imágenes de productos

### 4. **Ejecutar la aplicación**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 👤 Tipos de Usuario

### 🛒 **Usuario Regular**
- Navegar el catálogo de productos
- Agregar productos al carrito
- Realizar compras
- Ver historial personal

### 👨‍💼 **Administrador**
- Todas las funciones de usuario regular
- Gestionar productos (crear, editar, eliminar)
- Control de inventario
- Ver reportes de ventas
- Acceso al panel administrativo

## 📖 Guía de Uso

### 🔑 **Registro e Inicio de Sesión**

1. **Registrarse:**
   - Ve a `/register`
   - Completa email y contraseña
   - Se creará como usuario regular por defecto

2. **Iniciar Sesión:**
   - Ve a `/login`
   - Ingresa credenciales
   - Serás redirigido según tu rol

### 🛍️ **Comprar Productos (Usuario)**

1. **Navegar Catálogo:**
   - Página principal muestra todos los productos
   - Usa filtros por categoría
   - Ve detalles, precio y disponibilidad

2. **Agregar al Carrito:**
   - Haz clic en "Agregar al Carrito"
   - Ajusta cantidades
   - Ve el carrito en tiempo real

3. **Finalizar Compra:**
   - Ve a `/checkout`
   - Revisa tu carrito
   - Confirma la compra
   - Recibe confirmación

### 👨‍💼 **Gestión Administrativa**

#### **Productos**
1. **Ver Productos:** `/admin/productos`
2. **Agregar Producto:** `/admin/productos/nuevo`
   - Nombre, precio, categoría
   - Subir imagen
   - Establecer stock inicial
3. **Editar Producto:** Clic en producto → Editar
4. **Eliminar Producto:** Clic en producto → Eliminar

#### **Ventas**
1. **Reportes:** `/admin/ventas`
2. **Filtrar por fecha**
3. **Ver totales del día**

#### **Poblar Base de Datos**
- **Seeder:** `/admin/productos/seeder`
- Carga productos de prueba automáticamente

### 📱 **Navegación**

#### **Rutas Públicas**
- `/` - Tienda principal
- `/login` - Iniciar sesión
- `/register` - Registrarse

#### **Rutas de Usuario**
- `/checkout` - Carrito y compras

#### **Rutas de Admin**
- `/admin/productos` - Gestión de productos
- `/admin/ventas` - Reportes de ventas
- `/admin/productos/nuevo` - Crear producto
- `/admin/productos/editar/:id` - Editar producto

## 🎯 Funcionalidades Específicas

### 🏪 **Gestión de Inventario**
- Control automático de stock
- Alertas de productos agotados
- Actualización en tiempo real

### 💰 **Sistema de Ventas**
- Cálculo automático de impuestos
- Sistema de cupones/descuentos
- Historial de transacciones

### 🖼️ **Gestión de Imágenes**
- Subida automática a Firebase Storage
- Nombres únicos para evitar conflictos
- Optimización automática

### 📊 **Reportes**
- Ventas por día
- Productos más vendidos
- Control de ingresos

## 🐛 Solución de Problemas

### **Error: "Missing or insufficient permissions"**
- Verificar reglas de Firestore
- Asegurar que el usuario esté autenticado

### **Error: "Firebase: Error (auth/invalid-api-key)"**
- Verificar archivo `.env`
- Confirmar credenciales Firebase

### **Productos no cargan**
- Verificar conexión a Firestore
- Revisar estructura de datos

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Previsualización de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
MI_FINQUITA2/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── admin/       # Vistas administrativas
│   │   └── ...
│   ├── stores/          # Gestión de estado (Pinia)
│   ├── router/          # Configuración de rutas
│   ├── config/          # Configuración Firebase
│   ├── composables/     # Lógica reutilizable
│   ├── helpers/         # Funciones auxiliares
│   └── data/           # Datos estáticos
├── public/             # Archivos estáticos
└── ...
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte o preguntas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**¡Gracias por usar MI FINQUITA! 🌱**
