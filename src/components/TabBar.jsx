import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, TrendingUp, Bookmark, User } from 'lucide-react';

const TabBar = () => {
    const location = useLocation();

    const tabs = [
        { path: '/', icon: Zap, label: 'Practice' },
        { path: '/progress', icon: TrendingUp, label: 'Progress' },
        { path: '/library', icon: Bookmark, label: 'Library' },
        { path: '/profile', icon: User, label: 'Profile' }
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-[100] flex justify-around items-center border-t"
            style={{
                backgroundColor: '#0F1117',
                borderColor: '#2D3142',
                height: '64px',
                paddingBottom: 'env(safe-area-inset-bottom)'
            }}
        >
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = isActive(tab.path);

                return (
                    <Link
                        key={tab.path}
                        to={tab.path}
                        className="flex flex-col items-center justify-center flex-1 h-full transition-all"
                        style={{
                            color: active ? '#6366F1' : '#9CA3AF'
                        }}
                    >
                        <Icon
                            className="w-5 h-5 mb-1 transition-transform"
                            style={{
                                transform: active ? 'scale(1.1)' : 'scale(1)'
                            }}
                        />
                        <span
                            className="text-[10px] font-semibold uppercase tracking-wider"
                            style={{ fontFamily: 'Nunito' }}
                        >
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
};

export default TabBar;
