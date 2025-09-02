import React from 'react'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <a href="/dashboard" className="flex items-center hover:text-gray-900 transition-colors">
        <HomeIcon className="h-4 w-4" />
      </a>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRightIcon className="h-3 w-3 text-gray-400" />
          {item.href ? (
            <a href={item.href} className="hover:text-gray-900 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}