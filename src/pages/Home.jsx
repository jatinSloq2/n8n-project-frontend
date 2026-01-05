import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { reset } from '@/store/slices/authSlice';
import {
    Activity,
    AlertCircle,
    ArrowRight,
    ArrowUpRight,
    Bot,
    Boxes,
    Brain,
    Calendar,
    CheckCheck,
    CheckCircle,
    ChevronRight,
    Clock,
    Code,
    Cpu,
    Database,
    Eye,
    FileCode,
    FlaskConical,
    Folder,
    Gauge,
    GitBranch,
    Globe,
    Layers,
    Lightbulb,
    Lock,
    Mail,
    MessageSquare,
    Network,
    PlayCircle,
    Puzzle,
    Quote,
    Rocket,
    Shield,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Users,
    Workflow,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';


export default function Home() {
    const [activeFeature, setActiveFeature] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

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

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 6);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: GitBranch,
            title: 'Visual Workflow Builder',
            description: 'Design complex automation workflows with an intuitive drag-and-drop interface powered by AI suggestions.',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            details: 'Smart node placement, auto-routing, and AI-powered workflow optimization'
        },
        {
            icon: Zap,
            title: 'Lightning Fast Execution',
            description: 'Execute workflows in milliseconds with our optimized runtime engine and edge computing.',
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
            details: 'Sub-100ms latency, parallel execution, and intelligent caching'
        },
        {
            icon: Globe,
            title: 'Connect Anything',
            description: 'Integrate with 500+ services and APIs seamlessly with pre-built connectors.',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            details: 'REST APIs, GraphQL, webhooks, databases, and custom integrations'
        },
        {
            icon: Shield,
            title: 'Enterprise Security',
            description: 'Bank-level encryption, SOC2 compliance, and advanced security for your workflows.',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
            details: 'End-to-end encryption, audit logs, role-based access control'
        },
        {
            icon: Activity,
            title: 'Real-time Monitoring',
            description: 'Track workflow executions in real-time with detailed analytics and observability.',
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            details: 'Live dashboards, performance metrics, and predictive alerts'
        },
        {
            icon: Brain,
            title: 'AI-Powered Automation',
            description: 'Let AI suggest optimizations, detect errors, and auto-heal failing workflows.',
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
            details: 'Machine learning models, pattern recognition, and smart recommendations'
        },
    ];

    const stats = [
        { label: 'Active Users', value: '10K+', icon: Users, growth: '+125%' },
        { label: 'Workflows Created', value: '500K+', icon: GitBranch, growth: '+200%' },
        { label: 'Success Rate', value: '99.9%', icon: CheckCircle, growth: '+0.5%' },
        { label: 'Avg. Time Saved', value: '15hrs/week', icon: Clock, growth: '+40%' },
    ];

    const integrations = [
        { name: 'Slack', icon: MessageSquare, color: 'text-purple-500' },
        { name: 'Google Drive', icon: Folder, color: 'text-blue-500' },
        { name: 'Gmail', icon: Mail, color: 'text-red-500' },
        { name: 'Calendar', icon: Calendar, color: 'text-green-500' },
        { name: 'GitHub', icon: Code, color: 'text-gray-500' },
        { name: 'Database', icon: Database, color: 'text-yellow-500' },
        { name: 'API', icon: Network, color: 'text-indigo-500' },
        { name: 'Webhook', icon: Zap, color: 'text-orange-500' },
    ];

    const useCases = [
        {
            title: 'Marketing Automation',
            description: 'Automate email campaigns, social media posts, lead nurturing, and customer segmentation with AI-powered insights.',
            icon: '📧',
            stats: '10K+ campaigns automated',
            features: ['Email sequences', 'Social posting', 'Lead scoring', 'A/B testing']
        },
        {
            title: 'Data Processing',
            description: 'Transform, validate, sync, and analyze data across multiple platforms automatically with real-time processing.',
            icon: '📊',
            stats: '50M+ records processed',
            features: ['ETL pipelines', 'Data validation', 'Real-time sync', 'Analytics']
        },
        {
            title: 'DevOps Integration',
            description: 'Streamline CI/CD pipelines, automate deployments, monitor infrastructure, and manage releases effortlessly.',
            icon: '🚀',
            stats: '100K+ deployments',
            features: ['CI/CD pipelines', 'Auto-deployment', 'Infrastructure', 'Rollbacks']
        },
        {
            title: 'Business Operations',
            description: 'Automate invoicing, reporting, approvals, and routine business tasks to focus on strategic growth.',
            icon: '💼',
            stats: '1M+ tasks automated',
            features: ['Invoice automation', 'Reporting', 'Approvals', 'Task routing']
        },
    ];

    const testimonials = [
        {
            name: 'Sarah Chen',
            role: 'VP of Marketing at TechFlow',
            content: 'WorkflowPro transformed how we handle campaigns. We reduced manual work by 80% and our team can now focus on strategy instead of repetitive tasks.',
            avatar: '👩‍💼',
            rating: 5
        },
        {
            name: 'Marcus Rodriguez',
            role: 'CTO at DataSync Inc',
            content: 'The AI-powered automation is game-changing. It detected and fixed issues in our workflows before they became problems. Absolutely incredible.',
            avatar: '👨‍💻',
            rating: 5
        },
        {
            name: 'Emily Watson',
            role: 'Operations Manager at CloudCore',
            content: 'Setup was incredibly easy and the results were immediate. We automated 50+ processes in the first month and saved over $100K in operational costs.',
            avatar: '👩‍🔬',
            rating: 5
        }
    ];

    const workflows = [
        {
            title: 'Lead Enrichment Pipeline',
            description: 'Automatically enrich leads from multiple sources',
            steps: 4,
            time: '2 mins',
            icon: Target,
            color: 'bg-blue-500/10 text-blue-500'
        },
        {
            title: 'Invoice Processing',
            description: 'Extract, validate, and process invoices',
            steps: 6,
            time: '5 mins',
            icon: FileCode,
            color: 'bg-green-500/10 text-green-500'
        },
        {
            title: 'Deploy to Production',
            description: 'Build, test, and deploy with rollback',
            steps: 8,
            time: '3 mins',
            icon: Rocket,
            color: 'bg-purple-500/10 text-purple-500'
        },
        {
            title: 'Social Media Scheduler',
            description: 'Post across all platforms automatically',
            steps: 3,
            time: '1 min',
            icon: MessageSquare,
            color: 'bg-orange-500/10 text-orange-500'
        }
    ];

    const aiFeatures = [
        {
            icon: Brain,
            title: 'Smart Suggestions',
            description: 'AI analyzes your workflows and suggests optimizations to improve efficiency and reduce errors.'
        },
        {
            icon: Lightbulb,
            title: 'Auto-Healing',
            description: 'Automatically detect and fix common workflow failures without human intervention.'
        },
        {
            icon: Eye,
            title: 'Anomaly Detection',
            description: 'Machine learning models identify unusual patterns and alert you before issues escalate.'
        },
        {
            icon: Gauge,
            title: 'Performance Optimization',
            description: 'Continuous analysis of execution times with automatic performance tuning.'
        }
    ];

    const pricingTiers = [
        {
            name: 'Starter',
            price: '$29',
            description: 'Perfect for individuals and small teams',
            features: [
                '100 workflow executions/month',
                '5 active workflows',
                'Basic integrations',
                'Email support',
                '99.5% uptime SLA'
            ],
            popular: false
        },
        {
            name: 'Professional',
            price: '$99',
            description: 'For growing teams with advanced needs',
            features: [
                '10,000 workflow executions/month',
                'Unlimited active workflows',
                'All integrations',
                'Priority support',
                '99.9% uptime SLA',
                'AI-powered features',
                'Advanced analytics'
            ],
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'For large organizations',
            features: [
                'Unlimited executions',
                'Unlimited workflows',
                'Custom integrations',
                'Dedicated support',
                '99.99% uptime SLA',
                'Advanced AI features',
                'Custom training',
                'SSO & SAML'
            ],
            popular: false
        }
    ];

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
                            <Button className="relative overflow-hidden group">
                                <span className="relative z-10">Get Started</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section with Animated Background */}
            <section className="relative container px-4 py-20 md:py-28 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="relative mx-auto max-w-5xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 mb-8 bg-primary/5 border-primary/20 animate-bounce">
                        <Sparkles className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                        <span className="text-sm font-medium">AI-Powered Automation Platform</span>
                        <Badge variant="secondary" className="ml-2">New</Badge>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground animate-gradient">
                        Build Powerful Automations{' '}
                        <span className="text-primary relative">
                            Without Code
                            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                <path d="M0 6 Q150 12 300 6" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary/30" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                        WorkflowPro uses <span className="text-primary font-semibold">AI and machine learning</span> to help teams automate repetitive tasks, connect apps, and build intelligent workflows that adapt and improve over time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Link to="/register">
                            <Button size="lg" className="text-lg px-8 h-14 w-full sm:w-auto group relative overflow-hidden">
                                <span className="relative z-10 flex items-center">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="text-lg px-8 h-14 w-full sm:w-auto group">
                                <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                Watch Demo
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Free 14-day trial</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Animated Stats Section */}
            <section className="border-y bg-muted/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer"></div>
                <div className="container px-4 py-12 relative">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="text-center group hover:scale-105 transition-transform">
                                    <Icon className="h-8 w-8 mx-auto mb-3 text-primary group-hover:animate-bounce" />
                                    <div className="text-4xl md:text-5xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                                    <Badge variant="secondary" className="text-xs">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {stat.growth}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Interactive Features Section */}
            <section className="container px-4 py-24 md:py-32">
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4">
                        <Boxes className="h-3 w-3 mr-2" />
                        Platform Features
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">
                        Everything You Need to Automate
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Powerful features designed to make workflow automation simple, efficient, and intelligent
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        const isActive = index === activeFeature;
                        return (
                            <Card
                                key={index}
                                className={`border-2 transition-all duration-500 hover:shadow-xl cursor-pointer ${isActive ? 'border-primary shadow-lg scale-105' : 'hover:border-primary/50'
                                    }`}
                                onClick={() => setActiveFeature(index)}
                            >
                                <CardHeader>
                                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg ${feature.bgColor} mb-4 transition-transform ${isActive ? 'scale-110' : ''}`}>
                                        <Icon className={`h-7 w-7 ${feature.color} ${isActive ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                                    <CardDescription className="text-base mb-3">
                                        {feature.description}
                                    </CardDescription>
                                    {isActive && (
                                        <div className="pt-3 border-t animate-fadeIn">
                                            <p className="text-sm text-muted-foreground">{feature.details}</p>
                                        </div>
                                    )}
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>

                {/* Integration Grid */}
                <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">
                            500+ Integrations
                        </h3>
                        <p className="text-muted-foreground">
                            Connect with your favorite tools and services
                        </p>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                        {integrations.map((integration, index) => {
                            const Icon = integration.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex flex-col items-center justify-center p-4 bg-background rounded-lg hover:shadow-lg transition-all cursor-pointer group"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <Icon className={`h-8 w-8 ${integration.color} group-hover:scale-125 transition-transform`} />
                                    <span className="text-xs mt-2 text-muted-foreground">{integration.name}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center mt-8">
                        <Button variant="outline" className="group">
                            View All Integrations
                            <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* AI-Powered Features Section */}
            <section className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-background py-24 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="container px-4 relative">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 border-primary/50">
                            <Bot className="h-3 w-3 mr-2 animate-pulse" />
                            AI-Powered Intelligence
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Automation That Thinks
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Our AI doesn't just execute workflows—it learns, adapts, and improves them automatically
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
                        {aiFeatures.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
                                    <CardHeader>
                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                                                <CardDescription className="text-base">
                                                    {feature.description}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="text-center">
                        <Button size="lg" className="group">
                            <Cpu className="mr-2 h-5 w-5 group-hover:animate-spin" />
                            Learn More About Our AI
                            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Workflow Templates Section */}
            <section className="container px-4 py-24 md:py-32">
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4">
                        <FlaskConical className="h-3 w-3 mr-2" />
                        Ready-to-Use Templates
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">
                        Start in Seconds
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choose from hundreds of pre-built workflow templates or create your own
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {workflows.map((workflow, index) => {
                        const Icon = workflow.icon;
                        return (
                            <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group cursor-pointer">
                                <CardHeader>
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${workflow.color} mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-lg mb-2">{workflow.title}</CardTitle>
                                    <CardDescription className="text-sm mb-4">
                                        {workflow.description}
                                    </CardDescription>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Layers className="h-3 w-3" />
                                            {workflow.steps} steps
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {workflow.time}
                                        </span>
                                    </div>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>

                <div className="text-center">
                    <Button variant="outline" size="lg">
                        Browse 500+ Templates
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="bg-muted/30 py-24 md:py-32">
                <div className="container px-4">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4">
                            <Puzzle className="h-3 w-3 mr-2" />
                            Use Cases
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Built for Every Team
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            From marketing to engineering, WorkflowPro adapts to your unique workflow needs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {useCases.map((useCase, index) => (
                            <Card key={index} className="hover:shadow-xl transition-all border-2 hover:border-primary/50 group">
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="text-5xl">{useCase.icon}</div>
                                        <Badge variant="secondary" className="text-xs">
                                            {useCase.stats}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-2xl mb-3">{useCase.title}</CardTitle>
                                    <CardDescription className="text-base mb-4">
                                        {useCase.description}
                                    </CardDescription>
                                    <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                                        {useCase.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CheckCheck className="h-4 w-4 text-primary" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="container px-4 py-24 md:py-32">
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4">
                        <Quote className="h-3 w-3 mr-2" />
                        Customer Stories
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">
                        Loved by 10,000+ Teams
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        See what our customers have to say about transforming their workflows
                    </p>
                </div>

                <div className="max-w-4xl mx-auto mb-12">
                    <Card className="border-2 p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary"></div>
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="text-6xl">{testimonials[currentTestimonial].avatar}</div>
                            <div className="flex-1">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>
                                <p className="text-lg md:text-xl mb-6 leading-relaxed">
                                    "{testimonials[currentTestimonial].content}"
                                </p>
                                <div>
                                    <p className="font-semibold text-lg">{testimonials[currentTestimonial].name}</p>
                                    <p className="text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-2 mt-8">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentTestimonial(index)}
                                    className={`h-2 rounded-full transition-all ${index === currentTestimonial ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
                                        }`}
                                />
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <div className="text-center p-6 bg-muted/30 rounded-lg">
                        <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
                        <div className="text-sm text-muted-foreground">Average Rating</div>
                        <div className="flex justify-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            ))}
                        </div>
                    </div>
                    <div className="text-center p-6 bg-muted/30 rounded-lg">
                        <div className="text-4xl font-bold text-primary mb-2">98%</div>
                        <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                    </div>
                    <div className="text-center p-6 bg-muted/30 rounded-lg">
                        <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                        <div className="text-sm text-muted-foreground">Happy Customers</div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="bg-gradient-to-br from-background via-primary/5 to-background py-24 md:py-32">
                <div className="container px-4">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4">
                            <TrendingUp className="h-3 w-3 mr-2" />
                            Transparent Pricing
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Choose Your Plan
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Start free, scale as you grow. No hidden fees, cancel anytime.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {pricingTiers.map((tier, index) => (
                            <Card key={index} className={`relative ${tier.popular ? 'border-primary border-2 shadow-2xl scale-105' : 'border-2'}`}>
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-primary text-primary-foreground px-4 py-1">
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader className="text-center pb-8">
                                    <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                                    <div className="mb-4">
                                        <span className="text-5xl font-bold">{tier.price}</span>
                                        {tier.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
                                    </div>
                                    <CardDescription className="text-base">
                                        {tier.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 mb-8">
                                        {tier.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to="/register" className="block">
                                        <Button
                                            className="w-full"
                                            variant={tier.popular ? "default" : "outline"}
                                            size="lg"
                                        >
                                            {tier.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security & Compliance Section */}
            <section className="container px-4 py-24 md:py-32">
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4">
                        <Shield className="h-3 w-3 mr-2" />
                        Security & Compliance
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">
                        Enterprise-Grade Security
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Your data security and privacy is our top priority
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
                    {[
                        { icon: Shield, label: 'SOC 2 Type II', desc: 'Certified' },
                        { icon: Lock, label: 'GDPR', desc: 'Compliant' },
                        { icon: CheckCircle, label: 'HIPAA', desc: 'Ready' },
                        { icon: Globe, label: 'ISO 27001', desc: 'Certified' }
                    ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Card key={index} className="text-center p-6 hover:shadow-lg transition-all">
                                <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                                <div className="font-semibold mb-1">{item.label}</div>
                                <div className="text-sm text-muted-foreground">{item.desc}</div>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <Card className="p-6">
                        <Lock className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-semibold text-lg mb-2">End-to-End Encryption</h3>
                        <p className="text-sm text-muted-foreground">
                            All data encrypted in transit and at rest with AES-256 encryption
                        </p>
                    </Card>
                    <Card className="p-6">
                        <Eye className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Audit Logs</h3>
                        <p className="text-sm text-muted-foreground">
                            Complete audit trail of all actions and changes for compliance
                        </p>
                    </Card>
                    <Card className="p-6">
                        <Users className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Role-Based Access</h3>
                        <p className="text-sm text-muted-foreground">
                            Granular permissions and access controls for your team
                        </p>
                    </Card>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-muted/30 py-24 md:py-32">
                <div className="container px-4">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4">
                            <AlertCircle className="h-3 w-3 mr-2" />
                            FAQ
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            {
                                q: 'How long does it take to set up?',
                                a: 'You can create your first workflow in under 5 minutes. Our intuitive drag-and-drop interface and pre-built templates make it incredibly easy to get started.'
                            },
                            {
                                q: 'Do I need coding knowledge?',
                                a: 'Not at all! WorkflowPro is designed for everyone. However, developers can use our advanced features and custom code blocks for more complex automations.'
                            },
                            {
                                q: 'What integrations do you support?',
                                a: 'We support 500+ integrations including Slack, Google Workspace, Microsoft 365, Salesforce, GitHub, and many more. We also support custom API integrations and webhooks.'
                            },
                            {
                                q: 'Is my data secure?',
                                a: 'Absolutely. We use bank-level encryption (AES-256), are SOC 2 Type II certified, GDPR compliant, and follow industry best practices for data security.'
                            },
                            {
                                q: 'Can I cancel anytime?',
                                a: 'Yes! You can cancel your subscription at any time with no penalties or hidden fees. Your workflows will continue to run until the end of your billing period.'
                            },
                            {
                                q: 'Do you offer support?',
                                a: 'Yes! All plans include email support. Professional and Enterprise plans get priority support, and Enterprise customers get dedicated account managers.'
                            }
                        ].map((faq, index) => (
                            <Card key={index} className="p-6 hover:shadow-lg transition-all">
                                <div className="font-semibold text-lg mb-2">{faq.q}</div>
                                <p className="text-muted-foreground">{faq.a}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="container px-4 py-24 md:py-32">
                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20"></div>
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                    <CardContent className="relative p-12 md:p-20 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 mb-6 bg-background/50 backdrop-blur">
                            <Rocket className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Start Automating Today</span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Ready to Transform Your Workflow?
                        </h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Join 10,000+ teams already using WorkflowPro to save time, reduce errors, and boost productivity with AI-powered automation
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                            <Link to="/register">
                                <Button size="lg" className="text-lg px-10 h-16 w-full sm:w-auto group">
                                    Start Your Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button size="lg" variant="outline" className="text-lg px-10 h-16 w-full sm:w-auto">
                                    Schedule a Demo
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>14-day free trial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>Setup in 5 minutes</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Footer */}
            <footer className="border-t bg-muted/30">
                <div className="container px-4 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                        <div className="col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                                    <Workflow className="h-5 w-5" />
                                </div>
                                <span className="font-bold text-xl">WorkflowPro</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                                AI-powered automation platform that helps teams work smarter, not harder.
                            </p>
                            <div className="flex gap-3">
                                <Button size="icon" variant="outline" className="h-9 w-9">
                                    <Network className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="outline" className="h-9 w-9">
                                    <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="outline" className="h-9 w-9">
                                    <Mail className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Product</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Templates</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Company</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Partners</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Resources</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            © 2024 WorkflowPro. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .bg-grid-pattern {
                    background-image: 
                        linear-gradient(to right, currentColor 1px, transparent 1px),
                        linear-gradient(to bottom, currentColor 1px, transparent 1px);
                    background-size: 40px 40px;
                }
            `}</style>
        </div>
    );
}