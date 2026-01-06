// pages/Templates.jsx - FIXED VERSION
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertCircle,
    ArrowRight,
    Clock,
    Eye,
    Filter,
    Rocket,
    Search,
    Sparkles,
    TrendingUp,
    Zap,
    Layers,
    GitBranch,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    getTemplates,
    getTemplateById,
    createWorkflowFromTemplate,
} from '@/store/slices/templateSlice';

const DIFFICULTY_LEVELS = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
];

export default function Templates() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { templates, categories, isLoading, currentTemplate } = useSelector(
        (state) => state.template
    );
    //   const { user } = useSelector((state) => state.auth);
    const { user, isError, isSuccess, message } = useSelector((state) => state.auth);


    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [showPreview, setShowPreview] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState(null);

    useEffect(() => {
        dispatch(
            getTemplates({
                category: selectedCategory,
                difficulty: selectedDifficulty,
                search: searchTerm,
            })
        );
    }, [dispatch, selectedCategory, selectedDifficulty, searchTerm]);

    const sortedTemplates = [...templates].sort((a, b) => {
        if (sortBy === 'popular') return b.popularity - a.popularity;
        if (sortBy === 'newest') return b.usageCount - a.usageCount;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
    });

    const handleUseTemplate = async (templateId) => {
        try {
            // ✅ FIXED: Check if user is available
            if (!user || !user.id) {
                toast.error('Please log in to use templates');
                navigate('/login');
                return;
            }

            toast.success('Creating workflow from template...');

            // ✅ FIXED: Properly pass userId
            const result = await dispatch(
                createWorkflowFromTemplate({
                    templateId,
                    customData: {
                        userId: user.id, // ✅ Make sure userId is passed correctly
                    },
                })
            ).unwrap();

            toast.success('Template loaded! Customize your workflow.');
            navigate(`/workflows/${result._id}`);
        } catch (error) {
            console.error('Template creation error:', error);
            toast.error('Failed to load template: ' + (error.message || error));
        }
    };

    const handlePreviewTemplate = async (templateId) => {
        try {
            const result = await dispatch(getTemplateById(templateId)).unwrap();
            setPreviewTemplate(result);
            setShowPreview(true);
        } catch (error) {
            toast.error('Failed to load template preview');
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'intermediate':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'advanced':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    if (isLoading && templates.length === 0) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-muted-foreground font-medium">
                            Loading templates...
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                                {/* <Sparkles className="h-8 w-8 text-primary" /> */}
                                Workflow Templates
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                {templates.length}+ ready-to-use automation templates. Start in
                                minutes, not hours.
                            </p>
                        </div>
                    </div>

                    {/* Stats Banner */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Rocket className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{templates.length}+</p>
                                        <p className="text-xs text-muted-foreground">Templates</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">10k+</p>
                                        <p className="text-xs text-muted-foreground">Active Users</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Zap className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">5 min</p>
                                        <p className="text-xs text-muted-foreground">Avg. Setup</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Clock className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">40h</p>
                                        <p className="text-xs text-muted-foreground">Saved/Week</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search templates by name, description, or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                        {searchTerm && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={() => setSearchTerm('')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                        <Select
                            value={selectedDifficulty}
                            onValueChange={setSelectedDifficulty}
                        >
                            <SelectTrigger className="w-[160px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                {DIFFICULTY_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                        {level.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="popular">Most Popular</SelectItem>
                                <SelectItem value="newest">Most Used</SelectItem>
                                <SelectItem value="name">Name (A-Z)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    className="space-y-6"
                >
                    <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start">
                        {categories.map((category) => (
                            <TabsTrigger
                                key={category.id}
                                value={category.id}
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                            >
                                <span className="text-lg">{category.icon}</span>
                                <span>{category.name}</span>
                                <Badge variant="secondary" className="ml-1">
                                    {category.count}
                                </Badge>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {categories.map((category) => (
                        <TabsContent
                            key={category.id}
                            value={category.id}
                            className="space-y-4"
                        >
                            {sortedTemplates.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {sortedTemplates.map((template) => (
                                        <Card
                                            key={template.id}
                                            className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50 relative overflow-hidden"
                                        >
                                            {/* {template.popularity >= 90 && (
                                                <div className="absolute top-3 right-3 z-10">
                                                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 gap-1">
                                                        <Sparkles className="h-3 w-3" />
                                                        Popular
                                                    </Badge>
                                                </div>
                                            )} */}

                                            <CardHeader className="pb-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="text-3xl">{template.icon}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                                            {template.name}
                                                        </CardTitle>
                                                    </div>
                                                </div>
                                                <CardDescription className="line-clamp-2 min-h-[40px] mt-2">
                                                    {template.description}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="space-y-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {template.tags.slice(0, 3).map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {template.tags.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{template.tags.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {template.estimatedTime}
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${getDifficultyColor(
                                                            template.difficulty
                                                        )}`}
                                                    >
                                                        {template.difficulty}
                                                    </Badge>
                                                    <div className="flex items-center gap-1 ml-auto">
                                                        <TrendingUp className="h-3 w-3" />
                                                        {template.usageCount} uses
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        onClick={() => handleUseTemplate(template.id)}
                                                        className="flex-1 gap-2"
                                                        size="sm"
                                                    >
                                                        Use Template
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePreviewTemplate(template.id)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">
                                        No templates found
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Try adjusting your filters or search term
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedDifficulty('all');
                                            setSelectedCategory('all');
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>

                {/* Preview Dialog */}
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-2xl">
                                <span className="text-3xl">{previewTemplate?.icon}</span>
                                {previewTemplate?.name}
                            </DialogTitle>
                            <DialogDescription>
                                {previewTemplate?.description}
                            </DialogDescription>
                        </DialogHeader>

                        {previewTemplate && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Badge
                                        variant="outline"
                                        className={getDifficultyColor(previewTemplate.difficulty)}
                                    >
                                        {previewTemplate.difficulty}
                                    </Badge>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {previewTemplate.estimatedTime} setup
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <TrendingUp className="h-4 w-4" />
                                        {previewTemplate.usageCount} uses
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {previewTemplate.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Workflow Structure</h4>
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Layers className="h-5 w-5 text-primary" />
                                            <div>
                                                <p className="text-2xl font-bold">
                                                    {previewTemplate.nodes.length}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Nodes</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <GitBranch className="h-5 w-5 text-primary" />
                                            <div>
                                                <p className="text-2xl font-bold">
                                                    {previewTemplate.connections.length}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Connections
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-3">Included Nodes</h4>
                                    <div className="space-y-2">
                                        {previewTemplate.nodes.map((node, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                                            >
                                                <span className="text-2xl">{node.data.icon}</span>
                                                <div>
                                                    <p className="font-medium">{node.data.label}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {node.data.type}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        onClick={() => {
                                            handleUseTemplate(previewTemplate.id);
                                            setShowPreview(false);
                                        }}
                                        className="flex-1 gap-2"
                                    >
                                        Use This Template
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPreview(false)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}