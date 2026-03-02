import React from 'react';
import { Outlet } from 'react-router-dom';
import GlobalNav from '../components/Sidebar/GlobalNav';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background text-text-primary">
            {/* 1. Global Navigation (Far Left) */}
            <GlobalNav />

            {/* 2. Main Workspace Area (Takes up remaining space) */}
            <main className="flex-1 flex overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
