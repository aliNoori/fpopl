<script setup lang="ts">
import { useNuxtApp } from "nuxt/app"
import { ref, watch } from 'vue'
import type { AxiosInstance } from 'axios'
import { useRouter, useRoute } from "vue-router"
import { useAuthStore } from "~/store/auth"

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const nuxtApp = useNuxtApp()
const $axios = nuxtApp.$axios as AxiosInstance

const code = ref<string[]>(['', '', '', '']) // Array to store each digit of the code

// Read phone and country code from query parameters
const phoneNumber = route.query.phone as string | undefined
const countryCode = route.query.country as string | undefined

// Persian digit converter (from Nuxt plugin)
const $toPersian = useNuxtApp().$toPersian as (value: string) => string

// Convert Persian digits to English digits
function toEnglishDigits(str: string): string {
  return str.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
}

// Handle input of each digit field
async function handleInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/[^0-9]/g, '') // Allow only numbers

  if (value) {
    code.value[index] = value // Set the current digit
    input.value = $toPersian(value) // Show Persian digit

    // Move to the next input field
    const nextInput = input.nextElementSibling as HTMLInputElement
    if (nextInput) nextInput.focus()
  }

  // If all code inputs are filled, verify the code
  if (code.value.every(c => c !== '')) {
    try {
      const fullCode = code.value.join('')
      const response = await $axios.post('/auth/verify-code', {
        code: fullCode,
        phone: phoneNumber,
        country: countryCode
      })

      // Save the token and redirect to welcome page
      const token = response.data.token
      authStore.setToken(token)
      localStorage.setItem('auth_token', authStore.token)
      await router.push('/welcome')
    } catch (error) {
      console.error('خطا در ارسال کد:', error) // Log the error
    }
  }
}
</script>
<template>
  <div class="container">
    <div class="content">
<!--      <div class="back-link">
        &lt;!&ndash; Back to welcome page &ndash;&gt;
        <NuxtLink to="/welcome" class="back-button">➝</NuxtLink>
      </div>-->
      <h2 class="title">کد تایید</h2>
      <p class="description">
        لطفا کد ارسال شده به<br>
        شماره موبایل <span class="phone-number">{{$toPersian('9355851170')}}</span> را وارد کنید
      </p>

      <!-- Input fields for the verification code -->
      <div class="input-container">
        <input
            v-for="i in 4"
            :key="i"
            maxlength="1"
            class="input-field"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            @input="(e) => handleInput(e, i - 1)"
        />
      </div>

      <!-- Timer for re-sending the code -->
      <p class="timer">۱:۴۷ مانده تا دریافت مجدد</p>
    </div>
  </div>
</template>
<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 32px 16px;
  text-align: center;
}

.content {
  width: 100%;
}

.back-link {
  display: flex;
  justify-content: flex-end;
}

.back-button {
  font-size: 24px;
  text-decoration: none;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-top: 48px;
}

.description {
  color: #6b7280;
  margin-top: 8px;
  font-size: 14px;
}

.phone-number {
  font-weight: 600;
}

.input-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}

.input-field {
  width: 48px;
  height: 56px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 24px;
  text-align: center;
  outline: none;
}

.input-field:focus {
  border-color: #34d399;
}

.timer {
  color: #6b7280;
  font-size: 14px;
  margin-top: 16px;
}
</style>
