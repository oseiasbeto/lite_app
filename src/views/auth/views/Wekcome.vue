<script setup>
import ButtonPrimary from '../components/ButtonPrimary.vue';
import ButtonSecondary from '../components/ButtonSecondary.vue';


</script>

<template>
  <!--start content home page area-->
  <div class="flex flex-col w-full h-screen text-text-primary">
    <div class="flex-1 flex flex-col items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-8" version="1.0" width="180px"
        viewBox="0 0 1024.000000 1024.000000" preserveAspectRatio="xMidYMid meet">
        <g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
          <path
            d="M3315 7420 c-16 -5 -203 -52 -416 -105 l-385 -97 -13 -72 c-51 -275 -177 -510 -370 -688 -65 -61 -203 -156 -295 -204 l-56 -29 0 -351 0 -351 118 -55 c64 -31 183 -86 265 -123 l147 -67 0 -537 c0 -638 4 -609 -98 -711 -51 -50 -86 -74 -144 -100 l-78 -35 0 -322 0 -321 137 -85 c76 -47 201 -124 278 -171 l140 -85 5 339 5 338 73 38 c98 50 202 147 233 216 l24 53 3 778 c1 427 -1 777 -5 777 -5 0 -53 -13 -108 -29 -55 -16 -178 -52 -274 -80 -96 -28 -176 -51 -178 -51 -1 0 -3 141 -3 314 l0 314 85 40 c127 61 258 155 365 262 163 164 271 351 334 581 l33 124 84 22 c46 11 245 60 442 108 197 48 356 89 355 90 -2 1 -75 34 -163 72 -328 144 -491 213 -501 212 -5 0 -22 -5 -39 -9z" />
          <path
            d="M8000 6765 c-212 -45 -433 -93 -492 -105 l-108 -23 0 -1068 c0 -1017 1 -1069 18 -1069 18 0 336 66 772 159 129 28 238 51 243 51 4 0 7 86 7 190 0 148 -3 190 -13 190 -7 0 -135 -27 -285 -60 -150 -33 -280 -60 -288 -60 -12 0 -14 42 -14 273 l0 272 203 43 c111 24 225 49 252 56 l50 12 3 183 c2 154 0 182 -12 178 -19 -7 -471 -107 -485 -107 -8 0 -11 65 -11 228 l0 229 198 42 c108 24 240 53 292 65 l95 22 3 192 2 192 -22 -1 c-13 0 -196 -38 -408 -84z" />
          <path
            d="M3683 6727 l-253 -62 0 -965 c0 -531 -1 -1205 -3 -1498 -1 -292 0 -532 3 -532 3 0 121 25 263 57 l257 57 0 352 0 353 42 91 c22 50 44 87 48 83 4 -4 76 -183 160 -398 84 -214 157 -394 161 -399 9 -11 461 83 477 98 3 3 -29 83 -71 178 -41 95 -128 295 -192 443 -64 149 -144 332 -177 408 l-60 138 97 197 c118 237 395 803 395 806 0 7 -480 -110 -489 -119 -5 -5 -77 -161 -161 -345 -83 -184 -168 -371 -190 -415 l-38 -80 -1 808 c-1 444 -4 807 -8 806 -5 -1 -122 -29 -260 -62z" />
          <path
            d="M6492 6462 l-213 -46 7 -1075 c4 -592 7 -1077 8 -1078 1 -2 973 206 994 213 9 3 11 44 6 191 -4 104 -8 189 -9 191 -2 3 -455 -93 -542 -115 l-23 -5 0 886 c0 487 -3 886 -7 885 -5 0 -104 -21 -221 -47z" />
          <path
            d="M5508 6290 c-382 -71 -625 -262 -683 -535 -12 -57 -15 -180 -15 -675 0 -353 5 -634 10 -675 40 -272 269 -400 610 -340 378 67 619 266 679 563 7 35 11 280 11 711 0 572 -2 664 -16 711 -63 213 -278 299 -596 240z m91 -358 c19 -9 44 -30 55 -45 21 -28 21 -40 24 -640 2 -424 0 -624 -8 -650 -16 -55 -61 -100 -131 -132 -116 -52 -212 -41 -263 28 -21 28 -21 37 -21 650 l0 622 22 42 c59 109 226 175 322 125z" />
        </g>
      </svg>
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold">Acontecendo agora</h1>
        <h3 class="text-xl mt-4">E aí?</h3>
      </div>
      <div class="w-full max-w-xs flex flex-col gap-4">
        <ButtonPrimary @click="$router.push('/auth/signup')">
          Inscrever-se
        </ButtonPrimary>
        <ButtonSecondary @click="$router.push('/auth/signin')">
          Entrar
        </ButtonSecondary>
      </div>
    </div>
    <div class="pb-4 px-4 text-center text-xs" style="color: rgb(113, 118, 123);">
      <div class="max-w-xs mx-auto">Ao se inscrever, você concorda com os <a href="#" rel="noopener noreferrer nofollow"
          target="_blank" role="link" class="text-blue-500"><span>Termos de Serviço</span></a> e a <a href="#"
          rel="noopener noreferrer nofollow" role="link" class="text-blue-500"><span>Política de Privacidade</span></a>,
        incluindo o <a href="#" rel="noopener noreferrer nofollow" role="link" class="text-blue-500"><span>Uso de
            Cookies</span></a>.</div>
    </div>
  </div>
</template>