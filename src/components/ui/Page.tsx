import React from 'react'

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="space-y-6 overflow-y-auto h-full">
            {children}
        </div>
    )
}

export default Page