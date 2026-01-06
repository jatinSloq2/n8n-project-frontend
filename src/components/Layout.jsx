import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { logout } from '@/store/slices/authSlice';
import { Workflow, LayoutDashboard, GitBranch, Activity, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Templates', path: '/templates', icon: Sparkles, badge: 'New' },
    { path: '/workflows', label: 'Workflows', icon: GitBranch },
    { path: '/executions', label: 'Executions', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <Link to="/dashboard" className="flex items-center space-x-2 mr-6">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-sm">
              <Workflow className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">WorkflowPro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 flex-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant={active ? 'secondary' : 'ghost'}
                    size="sm"
                    className={active ? 'bg-secondary' : ''}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            <div className="flex items-center space-x-2 border-l pl-4 ml-2">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden ml-auto items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="container px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={active ? 'secondary' : 'ghost'}
                      size="sm"
                      className={`w-full justify-start ${active ? 'bg-secondary' : ''}`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
              <div className="pt-4 border-t mt-4">
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <div className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
      <main className="container mx-auto p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}