import React from 'react';

interface PageLoaderProps {
    text?: string;
    fullScreen?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ text, fullScreen = false }) => {
    const containerClass = fullScreen
        ? 'min-h-screen flex flex-col items-center justify-center bg-background-main'
        : 'flex-grow min-h-[70vh] flex flex-col items-center justify-center';

    return (
        <div className={containerClass}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-16 h-16 bg-primary-main/20 rounded-full animate-ping"></div>
                    <div className="relative w-12 h-12 bg-primary-main/80 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold border border-background-light/30 text-white text-2xl">
                        A
                    </div>
                </div>
                {text && <p className="text-lg font-medium text-text-secondary mt-4">{text}</p>}
            </div>
        </div>
    );
};

export default PageLoader;
