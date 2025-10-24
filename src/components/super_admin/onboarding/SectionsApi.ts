interface Section {
    id: number
    uuid: string
    restaurant_id: number
    name: string
    design: string
    section_plan_url: string | null
    tables: Table[]
}

interface Table {
    id: number
    uuid: string
    restaurant_id: number
    table_number: number
    is_active: boolean
    section_id: number
    table_section: string
    table_design: string
    table_link: string
}

interface SectionCreateRequest {
    name: string
    design: string
    section_plan_url?: string | null
}

interface SectionUpdateRequest {
    name?: string
    design?: string
    section_plan_url?: string | null
}

interface TableCreateRequest {
    table_number: number
}

interface TableBatchCreateRequest {
    table_numbers: number[]
}

class SectionsAPI {
    private baseUrl: string
    private getHeaders: () => HeadersInit

    constructor(baseUrl: string, getAuthHeadersFn: () => HeadersInit) {
        this.baseUrl = baseUrl
        this.getHeaders = getAuthHeadersFn
    }

    /**
     * Create a new section for a restaurant
     */
    async createSection(
        restaurantId: number,
        data: SectionCreateRequest
    ): Promise<Section> {
        const response = await fetch(
            `${this.baseUrl}/super_admin/restaurants/${restaurantId}/sections`,
            {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            }
        )

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Failed to create section')
        }

        return response.json()
    }

    /**
     * Get all sections with tables for a restaurant
     */
    async getSections(restaurantId: number): Promise<Section[]> {
        const response = await fetch(
            `${this.baseUrl}/super_admin/restaurants/${restaurantId}/sections`,
            {
                method: 'GET',
                headers: this.getHeaders()
            }
        )

        if (!response.ok) {
            throw new Error('Failed to fetch sections')
        }

        return response.json()
    }

    /**
     * Update an existing section
     */
    async updateSection(
        restaurantId: number,
        sectionId: number,
        data: SectionUpdateRequest
    ): Promise<Section> {
        const response = await fetch(
            `${this.baseUrl}/super_admin/restaurants/${restaurantId}/sections/${sectionId}`,
            {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            }
        )

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Failed to update section')
        }

        return response.json()
    }

    /**
     * Delete a section (only if it has no tables)
     */
    async deleteSection(
        restaurantId: number,
        sectionId: number
    ): Promise<{ status: string; message: string }> {
        const response = await fetch(
            `${this.baseUrl}/super_admin/restaurants/${restaurantId}/sections/${sectionId}`,
            {
                method: 'DELETE',
                headers: this.getHeaders()
            }
        )

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Failed to delete section')
        }

        return response.json()
    }

    /**
     * Create a single table in a section
     */
    async createTable(
        restaurantId: number,
        sectionId: number,
        data: TableCreateRequest
    ): Promise<Table> {
        const response = await fetch(
            `${this.baseUrl}/super_admin/restaurants/${restaurantId}/sections/${sectionId}/tables`,
            {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            }
        )

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Failed to create table')
        }

        return response.json()
    }

    /**
     * Create multiple tables in a section (batch)
     */
    async createTablesBatch(
        restaurantId: number,
        sectionId: number,
        data: TableBatchCreateRequest
    ): Promise<Table[]> {
        const response = await fetch(
            `${this.baseUrl}/super_admin/restaurants/${restaurantId}/sections/${sectionId}/tables/batch`,
            {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            }
        )

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Failed to create tables')
        }

        return response.json()
    }

    /**
     * Delete a table
     */
    async deleteTable(
        restaurantId: number,
        tableId: number
    ): Promise<{ status: string; message: string }> {
        const response = await fetch(
            `${this.baseUrl}/super_admin/restaurants/${restaurantId}/tables/${tableId}`,
            {
                method: 'DELETE',
                headers: this.getHeaders()
            }
        )

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Failed to delete table')
        }

        return response.json()
    }
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
    if (typeof window === 'undefined') {
        return { 'Content-Type': 'application/json' }
    }

    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

// Helper to get API URL
function getApiUrl(): string {
    if (typeof window !== 'undefined') {
        const env = (window as any).env
        return `http://${env?.apiUrl || 'localhost:8000'}/${env?.apiVersion || 'v1'}`
    }
    return 'http://localhost:8000/v1'
}

// Export singleton instance
export const sectionsAPI = new SectionsAPI(getApiUrl(), getAuthHeaders)

// Export types
export type {
    Section,
    Table,
    SectionCreateRequest,
    SectionUpdateRequest,
    TableCreateRequest,
    TableBatchCreateRequest
}

// Export class for custom instances
export default SectionsAPI