/**
 * Super Admin API Client
 *
 * API functions for super admin operations
 */
import {env} from "@/lib/env";

export const BASE_URL = `${env.apiUrl}/${env.apiVersion}`
const API_BASE_URL = `http://${env.apiUrl}/${env.apiVersion}`

// Base API function from existing api.ts
async function apiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT' = 'GET',
    body?: any
): Promise<T> {
    const token = localStorage.getItem('auth_token')

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    }

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        config.body = JSON.stringify(body)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    // Добавить обработку 401
    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')

        // Редирект на логин
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(new Error('Unauthorized'))
    }

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

// Types для супер-админки
export interface RestaurantListItem {
    id: number
    name: string
    address: string
    city: string
    contact_email: string
    logo_url?: string
    is_active: boolean
    status: 'active' | 'inactive' | 'onboarding' | 'deleted'
    created_at: string
    total_orders: number
    revenue: string
    pos_connected: boolean
    onboarding_completed: boolean
}

export interface RestaurantDetail {
    id: number
    name: string
    address: string
    city: string
    postal_code: string
    country: string
    contact_email: string
    contact_phone?: string
    website?: string
    logo_url?: string
    banner_url?: string
    is_active: boolean
    status: string
    created_at: string
    stripe_account_id?: string
    service_fee_amount: number
    service_fee_type: string
    kvk_number?: string
    vat_number?: string
    total_orders: number
    revenue: string
    pos_connected: boolean
    onboarding_completed: boolean
}

export interface RestaurantCreateData {
    name: string
    address: string
    city: string
    postal_code: string
    country?: string
    contact_email: string
    contact_phone?: string
    website?: string
}

export interface RestaurantUpdateData {
    name?: string
    address?: string
    city?: string
    postal_code?: string
    country?: string
    contact_email?: string
    contact_phone?: string
    website?: string
}

export interface RestaurantStats {
    total_partners: number
    setup_required: number
    archived: number
    total_all: number
}

// API Functions
export async function getRestaurants(params: {
    search?: string
    location?: string
    status?: string
    limit?: number
    offset?: number
} = {}): Promise<RestaurantListItem[]> {
    const queryParams = new URLSearchParams()

    if (params.search) queryParams.append('search', params.search)
    if (params.location) queryParams.append('location', params.location)
    if (params.status) queryParams.append('status', params.status)
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())

    const endpoint = `/super_admin/restaurants${queryParams.toString() ? `?${queryParams}` : ''}`
    return apiRequest<RestaurantListItem[]>(endpoint)
}

export async function getRestaurantDetail(restaurantId: number): Promise<RestaurantDetail> {
    return apiRequest<RestaurantDetail>(`/super_admin/restaurants/${restaurantId}`)
}

export async function createRestaurant(data: RestaurantCreateData): Promise<RestaurantDetail> {
    return apiRequest<RestaurantDetail>(`/super_admin/restaurants`, 'POST', data)
}

export async function updateRestaurant(
    restaurantId: number,
    data: RestaurantUpdateData
): Promise<RestaurantDetail> {
    return apiRequest<RestaurantDetail>(`/super_admin/restaurants/${restaurantId}`, 'PUT', data)
}

export async function deleteRestaurant(restaurantId: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/super_admin/restaurants/${restaurantId}`, 'DELETE')
}

export async function restoreRestaurant(restaurantId: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/super_admin/restaurants/${restaurantId}/restore`, 'PATCH')
}

export async function getRestaurantStats(): Promise<RestaurantStats> {
    return apiRequest<RestaurantStats>(`/super_admin/restaurants/stats`)
}

export interface RestaurantDetailResponse {
    id: number
    name: string
    address: string
    city: string
    postal_code: string
    country: string
    contact_email: string
    contact_phone?: string
    website?: string
    logo_url?: string
    banner_url?: string
    is_active: boolean
    created_at: string
    updated_at: string
    stripe_account_id?: string
    service_fee_amount: number
    service_fee_type: string
    kvk_number?: string
    vat_number?: string
    total_orders: number
    revenue: string
    pos_connected: boolean
    onboarding_completed: boolean
    status: 'active' | 'inactive' | 'onboarding' | 'deleted'
}

export async function createRestaurantWithMedia(formData: FormData): Promise<RestaurantDetailResponse> {
    const token = localStorage.getItem('auth_token')

    const response = await fetch(`${API_BASE_URL}/super_admin/restaurants`, {
        method: 'POST',
        headers: {
            ...(token && {'Authorization': `Bearer ${token}`}),
            // НЕ устанавливаем Content-Type - браузер сам установит для FormData
        },
        body: formData
    })

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
        ;(error as any).response = {status: response.status, data: errorData}
        throw error
    }

    return response.json()
}


// === RESTAURANT MANAGEMENT TYPES ===

export interface RestaurantListItem {
    id: number
    name: string
    address: string
    city: string
    contact_email: string
    logo_url?: string
    is_active: boolean
    status: 'active' | 'inactive' | 'onboarding' | 'deleted'
    created_at: string
    total_orders: number
    revenue: string
    pos_connected: boolean
    onboarding_completed: boolean
}

export interface RestaurantDetail {
    id: number
    name: string
    address: string
    city: string
    postal_code: string
    country: string
    contact_email: string
    contact_phone?: string
    website?: string
    logo_url?: string
    banner_url?: string
    is_active: boolean
    status: string
    created_at: string
    stripe_account_id?: string
    service_fee_amount: number
    service_fee_type: string
    kvk_number?: string
    vat_number?: string
    total_orders: number
    revenue: string
    pos_connected: boolean
    onboarding_completed: boolean
}

export interface RestaurantCreateData {
    name: string
    address: string
    city: string
    postal_code: string
    country?: string
    contact_email: string
    contact_phone?: string
    website?: string
}

export interface RestaurantUpdateData {
    name?: string
    address?: string
    city?: string
    postal_code?: string
    country?: string
    contact_email?: string
    contact_phone?: string
    website?: string
}

export interface RestaurantStats {
    total_partners: number
    setup_required: number
    archived: number
    total_all: number
}

// === ONBOARDING TYPES ===

export interface OnboardingProgress {
    restaurant_id: number
    current_step: number
    completed_steps: number[]
    is_completed: boolean
    personnel_added: number
    stripe_connected: boolean
    pos_configured: boolean
    qr_stands_configured: boolean
    google_reviews_configured: boolean
    telegram_configured: boolean
}

export interface StepCompletion {
    step: number
    completed: boolean
    progress: OnboardingProgress
    message: string
}

export interface PersonnelMember {
    first_name: string
    last_name: string
    email: string
    phone?: string
    password: string
    role: 'manager' | 'staff'
}

export interface PersonnelStepData {
    personnel: PersonnelMember[]
}

export interface StripeStepData {
    connected: boolean
    stripe_account_id?: string
}

export interface POSStepData {
    pos_type: string
    username: string
    password: string
    base_url: string
    environment: 'production' | 'staging' | 'development' | 'test'
    is_active: boolean
}

export interface QRStandsStepData {
    selected_design: string
    table_count: string
    table_sections: {
        bar: string
        binnen: string
        terras: string
        lounge: string
    }
    floor_plans?: File[]
    notes?: string
}

export interface GoogleReviewsStepData {
    place_id: string
    review_link?: string
}

export interface TelegramStepData {
    restaurant_name: string
    configured: boolean
    group_link?: string
}

// === ONBOARDING API ===

export async function getRestaurantOnboardingProgress(restaurantId: number): Promise<OnboardingProgress> {
    return apiRequest<OnboardingProgress>(`/super_admin/restaurants/${restaurantId}/onboarding/progress`)
}

export async function completePersonnelStep(
    restaurantId: number,
    data: PersonnelStepData
): Promise<StepCompletion> {
    return apiRequest<StepCompletion>(
        `/super_admin/restaurants/${restaurantId}/onboarding/step/1/personnel`,
        'POST',
        data
    )
}

export async function completeStripeStep(
    restaurantId: number,
    data: StripeStepData
): Promise<StepCompletion> {
    return apiRequest<StepCompletion>(
        `/super_admin/restaurants/${restaurantId}/onboarding/step/2/stripe`,
        'POST',
        data
    )
}

export async function completePOSStep(
    restaurantId: number,
    data: POSStepData
): Promise<StepCompletion> {
    return apiRequest<StepCompletion>(
        `/super_admin/restaurants/${restaurantId}/onboarding/step/3/pos`,
        'POST',
        data
    )
}

export async function completeQRStandsStep(
    restaurantId: number,
    data: QRStandsStepData
): Promise<StepCompletion> {
    return apiRequest<StepCompletion>(
        `/super_admin/restaurants/${restaurantId}/onboarding/step/4/qr-stands`,
        'POST',
        data
    )
}

export async function completeGoogleReviewsStep(
    restaurantId: number,
    data: GoogleReviewsStepData
): Promise<StepCompletion> {
    return apiRequest<StepCompletion>(
        `/super_admin/restaurants/${restaurantId}/onboarding/step/5/google-reviews`,
        'POST',
        data
    )
}

export async function completeTelegramStep(
    restaurantId: number,
    data: TelegramStepData
): Promise<StepCompletion> {
    return apiRequest<StepCompletion>(
        `/super_admin/restaurants/${restaurantId}/onboarding/step/6/telegram`,
        'POST',
        data
    )
}

export async function skipOnboardingStep(
    restaurantId: number,
    stepNumber: number
): Promise<StepCompletion> {
    return apiRequest<StepCompletion>(
        `/super_admin/restaurants/${restaurantId}/onboarding/step/${stepNumber}/skip`,
        'POST'
    )
}

export async function completeOnboarding(restaurantId: number): Promise<StepCompletion> {
    return apiRequest<StepCompletion>(
        `/super_admin/restaurants/${restaurantId}/onboarding/complete`,
        'POST'
    )
}
