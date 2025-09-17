import React from 'react';
import { 
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export type UserSubPage = 'lista' | 'gestao';

interface TabNavigationProps {
  activeTab: UserSubPage;
  onTabChange: (tab: UserSubPage) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    {
      id: 'lista' as UserSubPage,
      label: 'Lista',
      icon: UsersIcon
    },
    {
      id: 'gestao' as UserSubPage,
      label: 'Gestão', 
      icon: ChartBarIcon
    }
  ];

  return (
    <div className="border-b border-edp-neutral-lighter">
      <div className="flex gap-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-1 py-4 text-sm font-edp transition-all duration-200 ${
                isActive
                  ? 'text-edp-marine font-semibold'
                  : 'text-edp-neutral-medium hover:text-edp-marine'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              
              {/* Sublinhado Verde Completo */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 transition-all duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};