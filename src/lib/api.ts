import { env } from '@/lib/env'
import {Balance, Payout, PayoutFilters, PayoutsResponse, PayoutStatistics} from "@/types/payouts";
import {
    TeamMember,
    TeamMemberCreateRequest,
    TeamMemberListResponse,
    TeamMemberPasswordChangeRequest,
    TeamMemberUpdateRequest, TeamStatsResponse
} from '@/types/team';

export const BASE_URL = `${env.apiUrl}/${env.apiVersion}`
const API_BASE_URL = `http://${env.apiUrl}/${env.apiVersion}`

// Function for performing API requests
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

// User interface matching backend UserResponse
export interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    phone?: string
    profile_picture_url?: string
    is_admin: boolean
    is_restaurant_admin: boolean
    is_restaurant_staff: boolean
    is_active: boolean
    restaurant_id: number
    created_at: string
    last_login_at?: string
    // Computed fields from backend
    full_name: string
    role: string
}


export async function apiGetCurrentUser(): Promise<User> {
    return apiRequest('/auth/me')
}

export interface RestaurantInfo {
    id: number
    name: string
    logo_url?: string
    address?: string
    email?: string
    website?: string
    description?: string
    is_active: boolean
    created_at: string
}

export async function apiGetRestaurantInfo(): Promise<RestaurantInfo> {
    return apiRequest('/restaurant_admin/restaurant/info')
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
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
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


export async function getPayouts(filters: PayoutFilters = {}): Promise<PayoutsResponse> {
    const params = new URLSearchParams()

    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.starting_after) params.append('starting_after', filters.starting_after)

    const queryString = params.toString()
    const endpoint = `/restaurant_admin/payouts${queryString ? `?${queryString}` : ''}`
    
    return apiRequest<PayoutsResponse>(endpoint)
}

export async function getBalance(): Promise<Balance> {
    return apiRequest<Balance>('/restaurant_admin/payouts/balance')
}

export async function getStatistics(): Promise<PayoutStatistics> {
    return apiRequest<PayoutStatistics>('/restaurant_admin/payouts/statistics')
}

export async function getPayoutDetails(payoutId: string): Promise<Payout> {
    return apiRequest<Payout>(`/restaurant_admin/payouts/${payoutId}`)
}

async function apiUpload<T>(
    endpoint: string,
    file: File
): Promise<T> {
    const token = localStorage.getItem('auth_token')

    const formData = new FormData()
    formData.append('file', file)

    const config: RequestInit = {
        method: 'POST',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData
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

// Types
export interface UserProfile {
    id: number
    email: string
    first_name: string
    last_name: string
    phone: string | null
    profile_picture_url: string | null
    created_at: string | null
    last_login_at: string | null
}

export interface UserProfileUpdate {
    first_name: string
    last_name: string
    email: string
    phone: string | null
}

export interface RestaurantSettings {
    id: number
    name: string
    address: string
    city: string
    postal_code: string
    country: string
    contact_email: string
    contact_phone: string | null
    logo_url: string
    banner_url: string | null
    kvk_number?: string
    vat_number?: string
}

export interface RestaurantSettingsUpdate {
    name: string
    address: string
    city: string
    postal_code: string
    country: string
    contact_email: string
    contact_phone: string | null
    kvk_number?: string
    vat_number?: string
}

export interface NotificationSettings {
    email_notifications: boolean
    push_notifications: boolean
    telegram_notifications: boolean
    new_orders: boolean
    payment_received: boolean
    staff_activity: boolean
    daily_summary: boolean
    weekly_report: boolean
}

export interface TelegramSettings {
    group_chat_id: string | null
    group_name: string | null
    is_connected: boolean
    notification_language: string
}

export interface TelegramSettingsUpdate {
    notification_language: string
}

export interface PasswordChangeRequest {
    current_password: string
    new_password: string
    confirm_password: string
}

export interface FileUploadResponse {
    url: string
    message?: string
}

export interface MessageResponse {
    message: string
}

// User Profile API
export async function getUserProfile(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/restaurant_admin/profile')
}

export async function updateUserProfile(data: UserProfileUpdate): Promise<UserProfile> {
    return apiRequest<UserProfile>('/restaurant_admin/profile', 'PUT', data)
}

export async function uploadProfileAvatar(file: File): Promise<FileUploadResponse> {
    return apiUpload<FileUploadResponse>('/restaurant_admin/profile/avatar', file)
}

export async function changePassword(data: PasswordChangeRequest): Promise<MessageResponse> {
    return apiRequest<MessageResponse>('/restaurant_admin/password/change', 'POST', data)
}

// Restaurant Settings API
export async function getRestaurantSettings(): Promise<RestaurantSettings> {
    return apiRequest<RestaurantSettings>('/restaurant_admin/restaurant')
}

export async function updateRestaurantSettings(data: RestaurantSettingsUpdate): Promise<RestaurantSettings> {
    return apiRequest<RestaurantSettings>('/restaurant_admin/restaurant', 'PUT', data)
}

export async function uploadRestaurantLogo(file: File): Promise<FileUploadResponse> {
    return apiUpload<FileUploadResponse>('/restaurant_admin/restaurant/logo', file)
}

export async function uploadRestaurantBanner(file: File): Promise<FileUploadResponse> {
    return apiUpload<FileUploadResponse>('/restaurant_admin/restaurant/banner', file)
}

// Notification Settings API
export async function getNotificationSettings(): Promise<NotificationSettings> {
    return apiRequest<NotificationSettings>('/restaurant_admin/notifications')
}

export async function updateNotificationSettings(data: NotificationSettings): Promise<NotificationSettings> {
    return apiRequest<NotificationSettings>('/restaurant_admin/notifications', 'PUT', data)
}

// Telegram Settings API
export async function getTelegramSettings(): Promise<TelegramSettings> {
    return apiRequest<TelegramSettings>('/restaurant_admin/notifications/telegram')
}

export async function updateTelegramSettings(data: TelegramSettingsUpdate): Promise<TelegramSettings> {
    return apiRequest<TelegramSettings>('/restaurant_admin/notifications/telegram', 'PUT', data)
}

export async function sendTestTelegramNotification(): Promise<MessageResponse> {
    return apiRequest<MessageResponse>('/restaurant_admin/notifications/telegram/test', 'POST')
}


// Team Management API
export async function apiGetTeamMembers(includeInactive: boolean = true): Promise<TeamMemberListResponse> {
    const params = new URLSearchParams({
        include_inactive: includeInactive.toString()
    })
    return apiRequest<TeamMemberListResponse>(`/restaurant_admin/team?${params}`)
}

export async function apiCreateTeamMember(memberData: TeamMemberCreateRequest): Promise<TeamMember> {
    return apiRequest<TeamMember>('/restaurant_admin/team', 'POST', memberData)
}

export async function apiGetTeamMember(memberId: number): Promise<TeamMember> {
    return apiRequest<TeamMember>(`/restaurant_admin/team/${memberId}`)
}

export async function apiUpdateTeamMember(memberId: number, updateData: TeamMemberUpdateRequest): Promise<TeamMember> {
    return apiRequest<TeamMember>(`/restaurant_admin/team/${memberId}`, 'PUT', updateData)
}

export async function apiDeleteTeamMember(memberId: number): Promise<MessageResponse> {
    return apiRequest<MessageResponse>(`/restaurant_admin/team/${memberId}`, 'DELETE')
}

export async function apiChangeTeamMemberStatus(memberId: number, isActive: boolean): Promise<TeamMember> {
    return apiRequest<TeamMember>(`/restaurant_admin/team/${memberId}/status`, 'PUT', { is_active: isActive })
}

export async function apiChangeTeamMemberPassword(memberId: number, passwordData: TeamMemberPasswordChangeRequest): Promise<MessageResponse> {
    return apiRequest<MessageResponse>(`/restaurant_admin/team/${memberId}/password`, 'PUT', passwordData)
}

export async function apiGetTeamStats(): Promise<TeamStatsResponse> {
    return apiRequest<TeamStatsResponse>('/restaurant_admin/team/stats')
}
