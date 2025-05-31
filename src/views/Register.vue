<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');

const handleRegister = ({ email, password }) => {
    auth.register({ email, password });
};
</script>

<template>
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
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Crear Cuenta de Cliente</h2>
                <p class="text-gray-600">Regístrate para acceder a nuestros productos agropecuarios</p>
            </div>

            <!-- Registration Form -->
            <div class="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8">
                <!-- User Type Info -->
                <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                            <span class="text-xl">👤</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-emerald-900">Cuenta de Cliente</h3>
                            <p class="text-sm text-emerald-700">Tendrás acceso para comprar productos y realizar pedidos</p>
                        </div>
                    </div>
                </div>

                <FormKit id="registerForm" 
                         type="form" 
                         @submit="handleRegister" 
                         :actions="false"
                         incomplete-message="⚠️ Por favor completa todos los campos"
                         :classes="{ form: 'space-y-6' }">
                    
                    <FormKit type="email" 
                             v-model="email" 
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
                             v-model="password" 
                             label="Contraseña" 
                             name="password"
                             placeholder="Mínimo 6 caracteres" 
                             validation="required|length:6,50" 
                             :validation-messages="{
                                 required: 'La contraseña es obligatoria',
                                 length: 'La contraseña debe tener entre 6 y 50 caracteres',
                             }"
                             :classes="{
                                 outer: 'mb-0',
                                 input: 'mt-2 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors'
                             }" />
                    
                    <FormKit type="submit" 
                             :classes="{
                                 input: 'w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg'
                             }">
                        🚀 Crear Cuenta de Cliente
                    </FormKit>
                </FormKit>
                
                <!-- Login Link -->
                <div class="mt-6 text-center">
                    <p class="text-gray-600">
                        ¿Ya tienes una cuenta?
                        <RouterLink to="/login" 
                                   class="font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                            Inicia Sesión
                        </RouterLink>
                    </p>
                </div>
            </div>

            <!-- Features Info -->
            <div class="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
                <h3 class="font-semibold text-gray-900 mb-4 text-center">Con tu cuenta podrás:</h3>
                <div class="grid grid-cols-1 gap-3">
                    <div class="flex items-center">
                        <span class="text-lg mr-3">🛒</span>
                        <span class="text-sm text-gray-700">Navegar y comprar productos</span>
                    </div>
                    <div class="flex items-center">
                        <span class="text-lg mr-3">📦</span>
                        <span class="text-sm text-gray-700">Realizar pedidos personalizados</span>
                    </div>
                    <div class="flex items-center">
                        <span class="text-lg mr-3">📱</span>
                        <span class="text-sm text-gray-700">Contacto directo vía WhatsApp</span>
                    </div>
                    <div class="flex items-center">
                        <span class="text-lg mr-3">🚚</span>
                        <span class="text-sm text-gray-700">Seguimiento de entregas</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
