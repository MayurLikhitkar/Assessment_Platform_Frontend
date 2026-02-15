import React from 'react'

const DataLoader: React.FC = () => {
    return (
        <div className="loading-spinner">
            <div className="loading-spinner-inner">
                <div className="loading-spinner-circle"></div>
                <div className="loading-spinner-circle"></div>
                <div className="loading-spinner-circle"></div>
                <div className="loading-spinner-circle"></div>
                <div className="loading-spinner-circle"></div>
            </div>
        </div>
    )
}

export default DataLoader