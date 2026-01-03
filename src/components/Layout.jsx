import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { logout } from '@/store/slices/authSlice';
import { Workflow, LayoutDashboard, GitBranch, Activity, LogOut } from 'lucide-react';

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground p-2 rounded">
              <Workflow className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">WorkflowPro</span>
          </Link>
          
          <nav className="ml-auto flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/workflows">
              <Button variant="ghost" size="sm">
                <GitBranch className="h-4 w-4 mr-2" />
                Workflows
              </Button>
            </Link>
            <Link to="/executions">
              <Button variant="ghost" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Executions
              </Button>
            </Link>
            
            <ThemeToggle />
            
            <div className="flex items-center space-x-2 border-l pl-4">
              <span className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
}