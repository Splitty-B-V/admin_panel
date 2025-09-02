import { env } from '@/lib/env'

export const BASE_URL = `${env.apiUrl}/${env.apiVersion}`
const API_BASE_URL = `https://${env.apiUrl}/${env.apiVersion}`

// Function for performing API requests
async function apiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
): Promise<T> {
    const token = localStorage.getItem('restaurant_token')

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    }

    if (body && (method === 'POST' || method === 'PATCH')) {
        config.body = JSON.stringify(body)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`
        let errorData: any = null

        try {
            errorData = await response.json()
            if (errorData.detail) {
                errorMessage = errorData.detail
            }
        } catch {
        }

        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        ;(error as any).response = { status: response.status, data: errorData }
        throw error
    }

    return response.json()
}


export async function apiLoginRestaurant(
    email: string,
    password: string
) {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: formData,
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Login failed')
    }

    return response.json()
}


export async function getRecentPayments(limit = 10, offset = 0, tableNumber?: number) {
    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
    })

    if (tableNumber) {
        params.append('table_number', tableNumber.toString())
    }

    return apiRequest(`/restaurant_admin/payments?${params}`)
}

export async function getPaymentDetails(paymentId: string) {
    return apiRequest(`/restaurant_admin/payments/${paymentId}`)
}
