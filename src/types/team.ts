export interface TeamMember {
    id: number
    email: string
    first_name: string
    last_name: string
    phone: string | null
    profile_picture_url: string | null
    is_restaurant_admin: boolean
    is_restaurant_staff: boolean
    is_active: boolean
    restaurant_id: number
    created_at: string
    last_login_at: string | null
    full_name: string  // computed property from backend
    role: string       // computed property from backend
}

export interface TeamMemberCreateRequest {
    first_name: string
    last_name: string
    email: string
    phone?: string
    password: string
    is_restaurant_admin?: boolean
}

export interface TeamMemberUpdateRequest {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    is_restaurant_admin?: boolean
}

export interface TeamMemberPasswordChangeRequest {
    new_password: string
    confirm_password: string
}

export interface TeamMemberStatusRequest {
    is_active: boolean
}

export interface TeamStatsResponse {
    total_members: number
    active_members: number
    inactive_members: number
    admin_members: number
    staff_members: number
    recent_logins: number
}

export interface TeamMemberListResponse {
    members: TeamMember[]
    total: number
    active_count: number
    admin_count: number
    staff_count: number
}

// Utility types for form handling
export interface TeamMemberFormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
    confirmPassword: string
    role: 'manager' | 'staff'
}

export interface PasswordChangeFormData {
    newPassword: string
    confirmPassword: string
}
