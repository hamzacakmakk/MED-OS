import React from 'react';
import { Activity, Users, FileStack, Settings, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

const GlobalNav = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Patients Queue', path: '/queue' },
        { icon: FileStack, label: 'Imaging & PACS', path: '/imaging' },
        { icon: Activity, label: 'Global Vitals', path: '/vitals' },
    ];

    return (
        <nav className="w-20 bg-[#09090b] flex flex-col items-center py-6 border-r border-[#27272a] z-50">
            {/* Logo Area */}
            <div className="mb-10 w-12 h-12 bg-medical-900/30 border border-medical-800/50 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)] cursor-pointer">
                <span className="text-medical-100 font-bold text-xl tracking-tighter">RW</span>
            </div>

            {/* Nav Links */}
            <div className="flex flex-col gap-6 flex-1">
                {navItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "p-3 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-medical-900/20 text-medical-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)] border border-medical-800/50"
                                    : "text-text-tertiary hover:bg-[#27272a] hover:text-text-primary border border-transparent"
                            )
                        }
                        title={item.label}
                    >
                        <item.icon className="w-6 h-6" strokeWidth={2} />
                        {/* Tooltip */}
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#27272a] text-text-primary px-3 py-1.5 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-[#3f3f46]">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </div>

            {/* Settings / User at the bottom */}
            <div className="mt-auto flex flex-col gap-4">
                <button className="p-3 text-text-tertiary hover:text-text-primary hover:bg-[#27272a] rounded-xl transition-colors">
                    <Settings className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 rounded-full bg-surface border-2 border-[#3f3f46] flex items-center justify-center overflow-hidden cursor-pointer">
                    <img src="https://ui-avatars.com/api/?name=Dr+Smith&background=27272a&color=fff" alt="User" className="w-full h-full object-cover" />
                </div>
            </div>
        </nav>
    );
};

export default GlobalNav;
