<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNuxtApp } from 'nuxt/app'
import type { AxiosInstance } from 'axios'

const router = useRouter()
const nuxtApp = useNuxtApp()
const $axios = nuxtApp.$axios as AxiosInstance

const name = ref('') // User's name input
const referralCode = ref('') // Optional referral code

// Handle user registration or profile update
async function handleRegister() {
  if (!name.value.trim()) {
    alert('لطفاً نام خود را وارد کنید') // Alert if name is empty
    return
  }

  try {
    const response = await $axios.post('/auth/update-profile', {
      name: name.value,
      referral_code: referralCode.value || null,
    })

    // Assuming the response contains a token or user info
    console.log('ثبت موفق:', response.data) // Registration success log

    // Redirect to homepage after successful registration
    await router.push('/')
  } catch (error) {
    console.error('خطا در ثبت نام:', error) // Log the registration error
    alert('مشکلی در ثبت نام پیش آمد') // Show error message
  }
}
</script>

<template>
  <div class="welcome-page">
    <h1>خوش آمدید</h1>
    <p class="subtext">
      یک نام انتخاب کنید و درصورت داشتن<br />
      کد معرف (اختیاری) آن را وارد کنید
    </p>

    <!-- Name input field -->
    <div class="form-group">
      <div class="input-box">
        <input type="text" v-model="name" required />
        <label>نام</label>
      </div>
    </div>

    <!-- Referral code input field (optional) -->
    <div class="form-group">
      <div class="input-box">
        <input type="text" v-model="referralCode" required />
        <label>کد معرف (اختیاری)</label>
      </div>
    </div>

    <!-- Submit button styled as NuxtLink -->
    <NuxtLink to="/" class="register-btn" @click="handleRegister">
      <span class="btn-text">ثبت</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.welcome-page {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

input, button, textarea {
  font-family: 'Vazir', sans-serif !important;
}

h1 {
  font-size: 1.6em;
  font-weight: bold;
  margin-bottom: 5px;
}

.subtext {
  color: #999;
  font-size: 0.95em;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
  text-align: right;
}

.input-box {
  position: relative;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 14px 12px 4px;
  background: #fff;
  direction: rtl;
  height: 48px;
}

.input-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1em;
  font-family: 'Vazir', sans-serif;
  padding: 0;
  height: 100%;
}

.input-box label {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 0 4px;
  color: #aaa;
  font-size: 1em;
  pointer-events: none;
  transition: all 0.2s ease;
}

/* When input is focused or filled, float the label */
.input-box input:focus + label,
.input-box input:valid + label {
  top: 0;
  font-size: 0.75em;
  color: #333;
  transform: translateY(-50%);
}

/* Custom styled submit button */
.register-btn {
  width: 90%;
  background: black;
  color: white;
  border: none;
  padding: 18px;
  border-radius: 10px;
  font-size: 1em;
  cursor: pointer;
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  gap: 10px;
}

.btn-text {
  flex-grow: 1;
  text-align: center;
}
</style>
