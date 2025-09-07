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


export async function apiGetCurrentUser() {
    return apiRequest('/auth/me')
}


export async function getRecentPayments(
    limit = 10,
    offset = 0,
    tableNumber?: number,
    searchPattern?: string,
    status?: string,
    dateFrom?: string,
    dateTo?: string
) {
    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
    })

    if (searchPattern?.trim()) {
        params.append('search_pattern', searchPattern.trim())
    }

    if (status && status !== 'all') {
        params.append('status', status)
    }

    if (dateFrom) {
        params.append('date_from', dateFrom)
    }

    if (dateTo) {
        params.append('date_to', dateTo)
    }

    return apiRequest(`/restaurant_admin/payments?${params}`)
}

export async function getPaymentDetails(paymentId: string) {
    return apiRequest(`/restaurant_admin/payments/${paymentId}`)
}

export async function getActiveTablesList() {
    return apiRequest(`/restaurant_admin/active_tables`)
}

export async function getDashboardAnalytics(params: {
    dateFilter: string
    customDateRange?: { start: string; end?: string }
}) {
    const queryParams = new URLSearchParams({
        date_filter: params.dateFilter,
        ...(params.customDateRange?.start && { start_date: params.customDateRange.start }),
        ...(params.customDateRange?.end && { end_date: params.customDateRange.end })
    })

    return apiRequest(`/restaurant_admin/dashboard_analytics?${queryParams}`)
}

export async function exportAnalyticsPDF(params: {
    dateFilter: string
    customDateRange?: { start: string; end?: string }
}): Promise<Blob> {
    const queryParams = new URLSearchParams({
        date_filter: params.dateFilter,
        ...(params.customDateRange?.start && { start_date: params.customDateRange.start }),
        ...(params.customDateRange?.end && { end_date: params.customDateRange.end })
    })

    const response = await fetch(`${API_BASE_URL}/restaurant_admin/export_analytics_pdf?${queryParams}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('restaurant_token')}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.blob()
}

export async function getOrderDetail(orderId: string) {
    return apiRequest(`/restaurant_admin/order/${orderId}`)
}
