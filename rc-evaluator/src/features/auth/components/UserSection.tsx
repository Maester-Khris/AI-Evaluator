import React, { use } from 'react'
import { MessageSquare, Search, Plus, LogOut, LogIn, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth';
import { useAuthModal } from '../hooks/useAuthModal';

const UserSection = () => {
    const { user, isAuthenticated, logout } = useAuth(); // Hypothetical user object/name
    const displayName = !isAuthenticated ? "Guest" : user.name; // Or pull from state
    const initial = displayName.charAt(0).toUpperCase();
    const { openModal } = useAuthModal();

    function handleButonClick() {
        if (!isAuthenticated) {
            openModal("login");
            console.log("trying to login");
        } else {
            console.log("trying to logout");
            logout();
        }
    }

    return (
        <div className="mt-auto pt-4 border-t border-white/10">
            <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                    {/* Avatar Circle */}
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-md border border-white/10">
                        {!isAuthenticated ? <User className="w-4 h-4" /> : initial}
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-zinc-200 truncate">
                            {displayName}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                            {!isAuthenticated ? 'Limited Access' : 'Pro Account'}
                        </span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => { handleButonClick() }}
                    className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    title={!isAuthenticated ? "Login" : "Logout"}
                >
                    {!isAuthenticated ? (
                        <LogIn className="w-4 h-4" />
                    ) : (
                        <LogOut className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    )
}

export default UserSection