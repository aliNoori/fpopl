import { defineStore } from 'pinia'

// Define the authentication store using Pinia
export const useAuthStore = defineStore('auth', {
    // State holds the token
    state: () => ({
        token: null as string | null, // Auth token, initially null
    }),

    // Actions to manipulate the token
    actions: {
        // Set a new token
        setToken(newToken: string) {
            this.token = newToken
        },

        // Clear the token
        clearToken() {
            this.token = null
        },

        // Load token from localStorage if available
        hydrateToken() {
            const savedToken = localStorage.getItem('auth_token')
            if (savedToken) {
                this.token = savedToken
            }
        }
    },

    // Getters to compute derived state
    getters: {
        // Check if the user is authenticated (token exists)
        isAuthenticated: (state) => !!state.token
    }
})
