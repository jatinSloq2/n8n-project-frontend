import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { reset } from '@/store/slices/authSlice';
import {
    Activity,
    ArrowRight,
    CheckCircle,
    Clock,
    GitBranch,
    Globe,
    Shield,
    Sparkles,
    TrendingUp,
    Users,
    Workflow,
    Zap,
} from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';


export default function Home() {
    const features = [
        {
            icon: GitBranch,
            title: 'Visual Workflow Builder',
            description: 'Design complex automation workflows with an intuitive drag-and-drop interface.',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            icon: Zap,
            title: 'Lightning Fast Execution',
            description: 'Execute workflows in milliseconds with our optimized runtime engine.',
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
        },
        {
            icon: Globe,
            title: 'Connect Anything',
            description: 'Integrate with hundreds of services and APIs seamlessly.',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            icon: Shield,
            title: 'Enterprise Security',
            description: 'Bank-level encryption and security for your workflows and data.',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            icon: Activity,
            title: 'Real-time Monitoring',
            description: 'Track workflow executions in real-time with detailed analytics.',
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            icon: Clock,
            title: 'Scheduled Automation',
            description: 'Set up recurring workflows with flexible scheduling options.',
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
        },
    ];

    const stats = [
        { label: 'Active Users', value: '10K+', icon: Users },
        { label: 'Workflows Created', value: '500K+', icon: GitBranch },
        { label: 'Success Rate', value: '99.9%', icon: CheckCircle },
        { label: 'Uptime', value: '99.99%', icon: TrendingUp },
    ];

    const useCases = [
        {
            title: 'Marketing Automation',
            description: 'Automate email campaigns, social media posts, and lead nurturing workflows.',
            icon: '📧',
        },
        {
            title: 'Data Processing',
            description: 'Transform, validate, and sync data across multiple platforms automatically.',
            icon: '📊',
        },
        {
            title: 'DevOps Integration',
            description: 'Streamline CI/CD pipelines and automate deployment workflows.',
            icon: '🚀',
        },
        {
            title: 'Business Operations',
            description: 'Automate invoicing, reporting, and routine business tasks.',
            icon: '💼',
        },
    ];

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess || user) {
            navigate('/dashboard');
        }
        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-sm">
                            <Workflow className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl">WorkflowPro</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <Link to="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container px-4 py-20 md:py-32">
                <div className="mx-auto max-w-5xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 mb-8 bg-primary/5 border-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Automate Your Workflow Today</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                        Build Powerful Automations{' '}
                        <span className="text-primary">Without Code</span>
                    </h1>

                    <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                        WorkflowPro helps teams automate repetitive tasks, connect apps, and build workflows
                        that work seamlessly across your entire tech stack.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register">
                            <Button size="lg" className="text-lg px-8 h-14 w-full sm:w-auto">
                                Start Free Trial
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="text-lg px-8 h-14 w-full sm:w-auto">
                                View Demo
                            </Button>
                        </Link>
                    </div>

                    <p className="text-sm text-muted-foreground mt-6">
                        No credit card required • Free 14-day trial • Cancel anytime
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-y bg-muted/30">
                <div className="container px-4 py-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="text-center">
                                    <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                                    <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container px-4 py-20 md:py-32">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Everything You Need to Automate
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Powerful features designed to make workflow automation simple and efficient
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                                <CardHeader>
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bgColor} mb-4`}>
                                        <Icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    <CardDescription className="text-base">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="bg-muted/30 py-20 md:py-32">
                <div className="container px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Built for Every Team
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            From marketing to engineering, WorkflowPro adapts to your needs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {useCases.map((useCase, index) => (
                            <Card key={index} className="hover:shadow-lg transition-all">
                                <CardHeader>
                                    <div className="text-4xl mb-3">{useCase.icon}</div>
                                    <CardTitle className="text-xl">{useCase.title}</CardTitle>
                                    <CardDescription className="text-base">
                                        {useCase.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container px-4 py-20 md:py-32">
                <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
                    <CardContent className="p-12 md:p-16 text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Ready to Automate Your Workflow?
                        </h2>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Join thousands of teams already using WorkflowPro to save time and boost productivity
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register">
                                <Button size="lg" className="text-lg px-8 h-14 w-full sm:w-auto">
                                    Start Your Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button size="lg" variant="outline" className="text-lg px-8 h-14 w-full sm:w-auto">
                                    Talk to Sales
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Footer */}
            <footer className="border-t bg-muted/30">
                <div className="container px-4 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="font-semibold mb-3">Product</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Features</a></li>
                                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                                <li><a href="#" className="hover:text-foreground">Use Cases</a></li>
                                <li><a href="#" className="hover:text-foreground">Integrations</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">Company</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">About</a></li>
                                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">Resources</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                                <li><a href="#" className="hover:text-foreground">API Reference</a></li>
                                <li><a href="#" className="hover:text-foreground">Community</a></li>
                                <li><a href="#" className="hover:text-foreground">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">Legal</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                                <li><a href="#" className="hover:text-foreground">Security</a></li>
                                <li><a href="#" className="hover:text-foreground">Compliance</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                                <Workflow className="h-4 w-4" />
                            </div>
                            <span className="font-bold">WorkflowPro</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2024 WorkflowPro. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}