import React from 'react'

const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="mx-auto max-w-5xl p-4">
            {children}
        </div>
    )
}

export default Container