<script setup>
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-transparent">
  
    <!-- Conteúdo principal -->
    <div class="flex-1 flex flex-col justify-center px-6 py-8">
      <!-- Hero -->
      <div class="mb-10">
        <div class="text-5xl mb-4">👋</div>
        <h1 class="text-3xl font-bold text-[rgb(40,40,41)] dark:text-inherit mb-2">
          Acontecendo agora
        </h1>
        <p class="text-gray-600 dark:text-inherit text-base">
          Junte-se à conversa. Compartilhe momentos. Conecte-se com o mundo.
        </p>
      </div>

      <!-- Botões estilo Twitter -->
      <div class="space-y-3">
        <button 
          @click="$router.push('/auth/signup')"
          class="w-full py-3 bg-secondary hover:bg-blue-600 text-white font-bold rounded-full transition"
        >
          Criar conta
        </button>
        
        <button 
          @click="$router.push('/auth/signin')"
          class="w-full py-3 border text-[rgb(40,40,41)] dark:text-inherit dark:border-[rgb(57,56,57)] text-blue-500 font-bold rounded-full transition"
        >
          Fazer login
        </button>
      </div>

      <!-- Termos -->
      <p class="text-xs dark:text-greyDark text-center mt-8 px-4">
        Ao se inscrever, você concorda com os 
        <a href="#" class="text-blue-500 hover:underline">Termos de Serviço</a> 
        e a 
        <a href="#" class="text-blue-500 hover:underline">Política de Privacidade</a>, 
        incluindo o 
        <a href="#" class="text-blue-500 hover:underline">Uso de Cookies</a>.
      </p>
    </div>

    <!-- Footer simples mobile -->
    <footer class="px-6 py-4">
      <div class="flex justify-center gap-6 text-xs dark:text-greyDark">
        <a href="#">Sobre</a>
        <a href="#">Ajuda</a>
        <a href="#">Idioma</a>
      </div>
    </footer>
  </div>
</template>