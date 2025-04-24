import { defineNuxtPlugin } from 'nuxt/app'
import { useAuthStore } from "~/store/auth"
import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
    const api = axios.create({
        baseURL: 'http://127.0.0.1:8000/api/', // Base URL for the API
    })

    api.interceptors.request.use(config => {
        const authStore = useAuthStore()

        authStore.hydrateToken() // Restore token on page load

        const token = authStore.token

        console.log('توکن در Axios Interceptor:', token) // Logging token in Axios Interceptor

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}` // Set Authorization header if token exists
        }

        return config
    }, error => {
        return Promise.reject(error) // Pass the error if there's a request setup issue
    })

    // Make Axios instance available via `useNuxtApp().$axios`
    nuxtApp.provide('axios', api)
})
