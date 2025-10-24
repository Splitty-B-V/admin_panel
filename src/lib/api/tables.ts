import { env } from "@/lib/env"
import { Table } from "./sections"

const API_BASE_URL = `https://${env.apiUrl}/${env.apiVersion}`

function getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

// Создать один стол
export async function createTable(
    restaurantId: number,
    sectionId: number,
    tableNumber: number
): Promise<Table> {
    const response = await fetch(
        `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/sections/${sectionId}/tables`,
        {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ table_number: tableNumber })
        }
    )

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        window.location.href = '/login'
        return Promise.reject(new Error('Unauthorized'))
    }

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create table')
    }

    return response.json()
}

// Создать несколько столов (batch)
export async function createTablesBatch(
    restaurantId: number,
    sectionId: number,
    tableNumbers: number[]
): Promise<Table[]> {
    const response = await fetch(
        `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/sections/${sectionId}/tables/batch`,
        {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ table_numbers: tableNumbers })
        }
    )

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        window.location.href = '/login'
        return Promise.reject(new Error('Unauthorized'))
    }

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create tables')
    }

    return response.json()
}

// Удалить стол
export async function deleteTable(
    restaurantId: number,
    tableId: number
): Promise<{ status: string; message: string }> {
    const response = await fetch(
        `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/tables/${tableId}`,
        {
            method: 'DELETE',
            headers: getAuthHeaders()
        }
    )

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        window.location.href = '/login'
        return Promise.reject(new Error('Unauthorized'))
    }

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to delete table')
    }

    return response.json()
}

// Переключить статус стола (активен/неактивен)
export async function toggleTableStatus(
    restaurantId: number,
    tableId: number
): Promise<Table> {
    const response = await fetch(
        `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/tables/${tableId}/toggle`,
        {
            method: 'PATCH',
            headers: getAuthHeaders()
        }
    )

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        window.location.href = '/login'
        return Promise.reject(new Error('Unauthorized'))
    }

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to toggle table status')
    }

    return response.json()
}


// Экспорт в Google Sheets
export async function exportToGoogleSheets(
    restaurantId: number,
    regenerate: boolean = false
): Promise<{ success: boolean; sheet_url: string; message: string }> {
    const response = await fetch(
        `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/g-sheet?regenerate=${regenerate}`,
        {
            method: 'GET',
            headers: getAuthHeaders()
        }
    )

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        window.location.href = '/login'
        return Promise.reject(new Error('Unauthorized'))
    }

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to export to Google Sheets')
    }

    return response.json()
}
