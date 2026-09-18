import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LucideIcon } from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: string;
}

interface MobileWorkspaceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  items: SidebarItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  userRoleLabel?: string;
  userName?: string;
  userAvatar?: string;
}

export const MobileWorkspaceSidebar: React.FC<MobileWorkspaceSidebarProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  items,
  activeTab,
  onSelectTab,
  userRoleLabel,
  userName,
  userAvatar
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-slate-900 text-white z-50 flex flex-col shadow-2xl lg:hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg text-amber-500 tracking-wider">LUMO</span>
                  <span className="text-xs bg-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                    {userRoleLabel || 'Workspace'}
                  </span>
                </div>
                <h2 className="text-sm font-semibold text-slate-200 mt-0.5">{title}</h2>
                {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Summary */}
            {userName && (
              <div className="p-4 bg-slate-800/40 border-b border-slate-800/60 flex items-center gap-3">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full border border-amber-500/40 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/40">
                    {userName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-100 truncate">{userName}</p>
                  <p className="text-xs text-slate-400 truncate">{userRoleLabel || 'Verified User'}</p>
                </div>
              </div>
            )}

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-xs text-slate-500 text-center">
              LUMO Platform v2.0 • Secure Enterprise Mode
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
