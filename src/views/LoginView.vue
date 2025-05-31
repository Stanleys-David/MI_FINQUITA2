<script setup>
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/PageHeader.vue'
const route = useRoute()
const authRoutes = [{ name: "login", text: "Volver A inicio" }];
const auth = useAuthStore()

const handleSubmit = (formData) => {
    const { email, password } = formData
    auth.login({ email, password })
};

</script>

<template>
    <!-- Page Header -->
    <PageHeader 
        title="Iniciar Sesión"
        subtitle="Accede a tu cuenta de MI FINQUITA"
        icon="🔑"
        :show-back-button="false"
    />

    <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 flex items-center justify-center p-6">
        <div class="max-w-md w-full">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="flex gap-3 justify-center items-center mb-4">
                    <img src="/img/FAVI.png" alt="MI FINQUITA Logo" class="w-16 h-16">
                    <h1 class="text-3xl font-bold text-gray-900">
                        MI <span class="text-emerald-600">FINQUITA</span>
                    </h1>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
                <p class="text-gray-600">Accede a tu cuenta para gestionar tu negocio agropecuario</p>
            </div>

            <!-- Login Form -->
            <div class="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8">
                <!-- User Types Info -->
                <div class="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 mb-6">
                    <h3 class="font-semibold text-gray-900 mb-3 text-center">Tipos de Usuario</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="text-center">
                            <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <span class="text-lg">👤</span>
                            </div>
                            <p class="text-xs font-medium text-gray-900">Cliente</p>
                            <p class="text-xs text-gray-600">Comprar productos</p>
                        </div>
                        <div class="text-center">
                            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <span class="text-lg">👨‍💼</span>
                            </div>
                            <p class="text-xs font-medium text-gray-900">Admin</p>
                            <p class="text-xs text-gray-600">Gestionar tienda</p>
                        </div>
                    </div>
                </div>

                <FormKit id="loginForm" 
                         type="form" 
                         :actions="false"
                         incomplete-message="⚠️ Por favor completa todos los campos" 
                         @submit="handleSubmit"
                         :classes="{ form: 'space-y-6' }">
                    
                    <FormKit type="email" 
                             label="Correo Electrónico" 
                             name="email" 
                             placeholder="ejemplo@correo.com"
                             validation="required|email" 
                             :validation-messages="{
                                 required: 'El email es obligatorio',
                                 email: 'Por favor ingresa un email válido',
                             }"
                             :classes="{
                                 outer: 'mb-0',
                                 input: 'mt-2 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors'
                             }" />
                    
                    <FormKit type="password" 
                             label="Contraseña" 
                             name="password" 
                             placeholder="Tu contraseña"
                             validation="required" 
                             :validation-messages="{
                                 required: 'La contraseña es obligatoria',
                             }"
                             :classes="{
                                 outer: 'mb-0',
                                 input: 'mt-2 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors'
                             }" />
                    
                    <FormKit type="submit"
                             :classes="{
                                 input: 'w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg'
                             }">
                        🚀 Iniciar Sesión
                    </FormKit>
                </FormKit>
                
                <!-- Register Link -->
                <div class="mt-6 text-center">
                    <p class="text-gray-600">
                        ¿No tienes una cuenta?
                        <RouterLink to="/Register" 
                                   class="font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                            Regístrate como Cliente
                        </RouterLink>
                    </p>
                </div>
            </div>

            <!-- Demo Info -->
            <div class="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
                <h3 class="font-semibold text-gray-900 mb-3 text-center">🎯 Demo del Sistema</h3>
                <div class="space-y-2">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600">🧪 Admin Demo:</span>
                        <code class="bg-gray-100 px-2 py-1 rounded text-xs">admin@demo.com</code>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600">👤 Cliente Demo:</span>
                        <code class="bg-gray-100 px-2 py-1 rounded text-xs">cliente@demo.com</code>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600">🔑 Contraseña:</span>
                        <code class="bg-gray-100 px-2 py-1 rounded text-xs">123456</code>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <nav class="flex flex-col items-center space-y-5 lg:flex-row mt-2 lg:justify-evenly lg:space-y-0">
        <RouterLink v-for="authRoute in authRoutes"
            class="uppercase font-bold text-white px-4 bottom-0 py-2 rounded-md " :to="{ name: authRoute.name }"
            :class="{ hidden: route.name === authRoute.name }">
            {{ authRoute.text }}
        </RouterLink>
    </nav>
</template>
