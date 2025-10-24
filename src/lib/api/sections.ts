import { env } from "@/lib/env"

const API_BASE_URL = `https://${env.apiUrl}/${env.apiVersion}`

function getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

export interface Table {
    id: number
    uuid: string
    restaurant_id: number
    table_number: number
    is_active: boolean
    section_id: number
    table_section: string | null
    table_design: string | null
    table_link: string | null
}

export interface Section {
    id: number
    uuid: string
    restaurant_id: number
    name: string
    design: string | null
    section_plan_url: string | null
    tables: Table[] | null
}

// Получить все секции с столами для ресторана
export async function getSectionsWithTables(restaurantId: number): Promise<Section[]> {
    const response = await fetch(
        `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/sections`,
        {
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
        throw new Error('Failed to fetch sections')
    }

    return response.json()
}

// Создать секцию
export async function createSection(
    restaurantId: number,
    data: {
        name: string
        design: string
        section_plan_url?: string | null
    }
): Promise<Section> {
    const response = await fetch(
        `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/sections`,
        {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
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
        throw new Error(error.detail || 'Failed to create section')
    }

    return response.json()
}

// Обновить секцию
export async function updateSection(
    restaurantId: number,
    sectionId: number,
    data: {
        name?: string
        design?: string
        section_plan_url?: string | null
    }
): Promise<Section> {
    const response = await fetch(
        `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/sections/${sectionId}`,
        {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
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
        throw new Error(error.detail || 'Failed to update section')
    }

    return response.json()
}

// Удалить секцию
export async function deleteSection(
    restaurantId: number,
    sectionId: number
): Promise<{ status: string; message: string }> {
    const response = await fetch(
        `${API_BASE_URL}/super_admin/restaurants/${restaurantId}/sections/${sectionId}`,
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
        throw new Error(error.detail || 'Failed to delete section')
    }

    return response.json()
}