import React from "react";
import { Outlet } from "react-router-dom";

const FullScreenLayout: React.FC = () => {
    return (
        <div className="h-screen bg-background-main text-text-main">
            <Outlet />
        </div>
    );
};

export default FullScreenLayout;