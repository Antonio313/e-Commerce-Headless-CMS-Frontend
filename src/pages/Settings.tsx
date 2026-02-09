import { useState } from 'react';
import { Settings as SettingsIcon, Users, Store, Share2, Bell, Search } from 'lucide-react';
import AdminUsers from '../components/settings/AdminUsers';
import StoreInfo from '../components/settings/StoreInfo';
import SocialMedia from '../components/settings/SocialMedia';
import Notifications from '../components/settings/Notifications';
import SEODefaults from '../components/settings/SEODefaults';

type Tab = 'users' | 'store' | 'social' | 'notifications' | 'seo';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  const tabs = [
    { id: 'users' as Tab, name: 'Admin Users', icon: Users },
    { id: 'store' as Tab, name: 'Store Info', icon: Store },
    { id: 'social' as Tab, name: 'Social Media', icon: Share2 },
    { id: 'notifications' as Tab, name: 'Notifications', icon: Bell },
    { id: 'seo' as Tab, name: 'SEO Defaults', icon: Search },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-gray-700" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your CMS configuration</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'store' && <StoreInfo />}
          {activeTab === 'social' && <SocialMedia />}
          {activeTab === 'notifications' && <Notifications />}
          {activeTab === 'seo' && <SEODefaults />}
        </div>
      </div>
    </div>
  );
}
