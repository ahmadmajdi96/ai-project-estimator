import { useAccountingAuth } from '@/hooks/useAccountingAuth';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Search, Settings, User, LogOut, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export function AccountingHeader() {
  const navigate = useNavigate();
  const { accountingUser, company, signOut, fullName } = useAccountingAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/accounting/auth');
  };

  const getInitials = () => {
    if (!accountingUser) return 'U';
    return `${accountingUser.first_name[0]}${accountingUser.last_name[0]}`.toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-500/20 text-red-400',
      accountant: 'bg-blue-500/20 text-blue-400',
      bookkeeper: 'bg-green-500/20 text-green-400',
      manager: 'bg-purple-500/20 text-purple-400',
      auditor: 'bg-orange-500/20 text-orange-400',
      employee: 'bg-slate-500/20 text-slate-400',
    };
    return colors[role] || colors.employee;
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-6">
      <SidebarTrigger className="text-slate-400 hover:text-white" />

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search transactions, customers, vendors..."
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-medium text-white flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={accountingUser?.avatar_url || ''} />
                <AvatarFallback className="bg-emerald-600 text-white text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{fullName}</p>
                <p className="text-xs text-slate-500">{company?.name}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
            <DropdownMenuLabel className="text-slate-300">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{fullName}</p>
                <p className="text-xs text-slate-500">{accountingUser?.email}</p>
                <Badge className={`w-fit mt-1 ${getRoleBadgeColor(accountingUser?.role || 'employee')}`}>
                  {accountingUser?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem 
              className="text-slate-300 focus:bg-slate-700 cursor-pointer"
              onClick={() => navigate('/accounting/profile')}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-slate-300 focus:bg-slate-700 cursor-pointer"
              onClick={() => navigate('/accounting/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem 
              className="text-red-400 focus:bg-slate-700 cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
