import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import SuperAdminLayout from "@/components/super_admin/SuperAdminLayout"
import RestaurantLayout from "@/components/restaurant/RestaurantLayout"

interface SmartLayoutProps {
    children: React.ReactNode
}

export default function SmartLayout({ children }: SmartLayoutProps) {
    const { userType } = useAuth()

    if (userType === 'super_admin') {
        return <SuperAdminLayout>{children}</SuperAdminLayout>
    }

    return <RestaurantLayout>{children}</RestaurantLayout>
}