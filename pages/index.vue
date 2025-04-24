<script setup lang="ts">
import {ref} from 'vue'
import {useNuxtApp} from 'nuxt/app'
import type {AxiosInstance} from 'axios'
import {useRouter} from 'vue-router'
import { computed } from 'vue'
const isMobileValid = computed(() => {
  return toEnglishDigits(mobile.value).length === 10
})
const router = useRouter()
const nuxtApp = useNuxtApp()

// Accessing Nuxt's Axios instance
const $axios = nuxtApp.$axios as AxiosInstance

// Utility to convert English digits to Persian
const $toPersian = nuxtApp.$toPersian as (value: string) => string

// Converts Persian digits to English digits
function toEnglishDigits(str: string): string {
  return str.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

// Country list with their respective codes and flags
const countries: Country[] = [
  {name: 'ایران', code: 'IR', flag: '🇮🇷', dialCode: '+98'},
  {name: 'ترکیه', code: 'TR', flag: '🇹🇷', dialCode: '+90'},
  {name: 'افغانستان', code: 'AF', flag: '🇦🇫', dialCode: '+93'},
]

// Currently selected country (default: Iran)
const selectedCountry = ref<Country>(countries[0])
const showCountryList = ref(false)

// When a country is selected from dropdown
const selectCountry = (country: Country) => {
  selectedCountry.value = country
  showCountryList.value = false
}

// Mobile number input (stored as Persian digits)
const mobile = ref('')

// Type definition for country object
interface Country {
  name: string
  code: string
  flag: string
  dialCode: string
}

// Handles the "Continue" button logic
async function handleContinue() {
  try {
    // Sends verification code
    await sendVerificationCode()

    const phoneNumber = selectedCountry.value.dialCode + toEnglishDigits(mobile.value)
    const country = selectedCountry.value.code

    // Redirects to verification page with query parameters
    await router.push({path: '/verify', query: {phone: phoneNumber, country: country}})
  } catch (error) {
    console.error('Error sending code or navigating:', error)
  }
}

// Handles mobile input field to allow only Persian digits
function handleInput(event: Event) {
  const input = event.target as HTMLInputElement
  const rawValue = input.value

  // Removes all non-digit characters
  const cleanedValue = rawValue.replace(/[^\d]/g, '')

  // Extract the last digit the user typed
  const newDigit = cleanedValue.slice(-1)

  // Prevent entering '0' as the first digit
  if (mobile.value.length === 0 && newDigit === '0') {
    return
  }
  // Detecting backspace (input length decreased)
  if (rawValue.length < mobile.value.length) {
    mobile.value = mobile.value.slice(0, -1)
  } else {
    // Appending last digit
    mobile.value += cleanedValue.slice(-1)
  }

  // Converts result to Persian digits for UI
  mobile.value = $toPersian(mobile.value)
}

// Sends the verification code to the server
async function sendVerificationCode() {
  try {
    const response = await $axios.post('auth/send-verification-code', {
      phone: toEnglishDigits(mobile.value),
      country: selectedCountry.value.dialCode,
    })
    console.log('Code sent:', response.data)
  } catch (error) {
    console.error('Error sending verification code:', error)
  }
}
</script>
<template>
  <div class="phone-page">
    <h1>شماره تلفن</h1>
    <p class="subtext">لطفاً کشور را انتخاب و سپس شماره رو وارد کنید</p>

    <div class="form-group floating-label" style="position: relative;">
      <div class="country-box" @click="showCountryList = !showCountryList">
        <div class="country-info">
          <span class="flag">{{ selectedCountry.flag }}</span>
          <span class="country-name">{{ selectedCountry.name }}</span>
        </div>
        <svg
            class="arrow" :class="{ rotated: showCountryList }"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
          <path d="M9 18l6-6-6-6"/>
        </svg>
        <input
            type="text"
            readonly
            placeholder=" "
            id="country"
            :value="selectedCountry.name + ' ' + selectedCountry.flag"
            class="hidden-input"
        />
        <label for="country">کشور</label>
      </div>

      <!-- Dropdown -->
      <ul v-if="showCountryList" class="country-list">
        <li
            v-for="country in countries"
            :key="country.code"
            @click="selectCountry(country)"
        >
          {{ country.name }} {{ country.flag }}
        </li>
      </ul>
    </div>


    <div class="form-group floating-label">
      <div class="phone-box">
        <span class="dial-code">{{ $toPersian(selectedCountry.dialCode) }}</span>
        <div class="divider"></div>
        <input type="tel"
               :value="mobile"
               @input="handleInput"
               inputmode="numeric"
               maxlength="10"
        />
        <label for="mobile">{{ $toPersian('شماره موبایل') }}</label>
      </div>
    </div>
    <button @click="handleContinue" :disabled="!isMobileValid" class="continue-btn">
      <span class="btn-text">ادامه</span>
      <span class="divider-line"></span>
      <svg
          class="arrow-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
      >
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>

  </div>
</template>
<style scoped>
.phone-page {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  text-align: center;
}
button:disabled {
  /*opacity: 0.5;*/
  cursor: not-allowed;
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
  text-align: right;
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.country-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 10px;
}

.arrow {
  font-size: 1.2em;
  color: #999;
}

.phone-box {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
}

.dial-code {
  color: #777;
  font-size: 0.95em;
  padding-left: 8px;
  white-space: nowrap;
}

.divider {
  width: 1px;
  height: 60%;
  background: #ccc;
  margin: 0 10px;
}

.phone-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1em;
  font-family: 'Vazir', sans-serif;
}

.continue-btn {
  width: 100%;
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
  flex-grow: 1; /* باعث می‌شود که متن وسط چین باشد */
  text-align: center;
}

.divider-line {
  width: 1px;
  height: 20px; /* ارتفاع مشخص برای خط جداکننده */
  background: #353535;
}

.arrow-icon {
  min-width: 20px;
  min-height: 20px;
}

.floating-label {
  position: relative;
  margin-bottom: 20px;
}

.floating-label .phone-box {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 14px 10px 4px;
  height: 45px;
  transition: border-color 0.2s;
}

.floating-label input {
  flex: 1;
  font-size: 1em;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'Vazir', sans-serif;
  padding: 0;
}

.floating-label label {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 1em;
  pointer-events: none;
  transition: 0.2s ease all;
  background: white;
  padding: 0 4px;
}

.floating-label input:focus + label,
.floating-label input:not(:placeholder-shown) + label {
  top: 0;
  font-size: 0.75em;
  color: #333;
}

.country-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 14px 10px 4px;
  height: 45px;
  background: white;
  cursor: pointer;
  direction: rtl;
}

.country-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.flag {
  font-size: 1.2em;
}

.country-name {
  font-size: 1em;
  color: #333;
}

.arrow {
  transform: rotate(180deg);
  font-size: 1.2em;
  color: #999;
  margin-right: auto;
  transition: transform 0.3s ease;
}

.arrow.rotated {
  transform: rotate(90deg);
}

.hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  height: 0;
}

.country-box label {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 1em;
  pointer-events: none;
  transition: 0.2s ease all;
  background: white;
  padding: 0 4px;
}

.country-box input:focus + label,
.country-box input:not(:placeholder-shown) + label {
  top: 0;
  font-size: 0.75em;
  color: #333;
}

.country-list {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  z-index: 10;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 5px;
  list-style: none;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.country-list li {
  padding: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.country-list li:hover {
  background: #f3f3f3;
}
</style>
