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
  const value = input.value.replace(/[^0-9]/g, '') // Allow only numeric input

  if (value) {
    code.value[index] = value // Set the value for the current input field
    input.value = $toPersian(value) // Display the Persian version of the number

    // Move focus to the next input field
    const nextInput = input.nextElementSibling as HTMLInputElement
    if (nextInput) nextInput.focus()
  }

  // If all code fields are filled, proceed with verification
  if (code.value.every(c => c !== '')) {
    try {
      const fullCode = code.value.join('') // Combine all the entered digits
      const response = await $axios.post('/auth/verify-code', {
        code: fullCode,
        phone: phoneNumber,
        country: countryCode
      })

      // Check response status and take appropriate action
      switch (response.status) {
        case 200:
          console.log('کاربر از قبل وجود دارد:', response.data.user) // Log user info
          alert('کاربر از قبل وجود دارد. خوش آمدید!')
          await router.push('/') // Redirect to welcome page
          break
        case 201:
          console.log('کاربر جدید با موفقیت ایجاد شد') // Handle new user creation
          const token = response.data.token
          authStore.setToken(token) // Save the token
          localStorage.setItem('auth_token', authStore.token) // Store token locally
          await router.push('/welcome') // Redirect to welcome page
          break
        case 422:
          console.error('کد نامعتبر یا منقضی شده است') // Handle invalid or expired code
          alert('کد نامعتبر یا منقضی شده است. لطفاً دوباره تلاش کنید.')
          break
        default:
          console.error('پاسخ غیرمنتظره:', response) // Handle unexpected response
          alert('خطایی رخ داده است. لطفاً بعداً تلاش کنید.')
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 409:
            console.error('تعارض: کاربر از قبل وجود دارد') // Handle conflict response
            alert('کاربر از قبل وجود دارد!')
            break
          default:
            console.error('خطا در فرایند تأیید:', error) // General error handling
            alert('خطایی رخ داده است. لطفاً بعداً تلاش کنید.')
        }
      } else {
        console.error('خطای شبکه یا سرور:', error) // Handle network/server error
        alert('اتصال به سرور برقرار نشد. لطفاً اینترنت خود را بررسی کنید.')
      }
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
