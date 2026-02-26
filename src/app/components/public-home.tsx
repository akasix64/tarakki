import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { API_BASE_URL } from '../lib/supabase';
import { publicAnonKey } from '/utils/supabase/info';
import { Briefcase, DollarSign, Calendar, MessageSquare, Search, LogIn, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { AuthPage } from './auth-page';

interface PublicHomeProps {
  onLogin: (user: any, accessToken: string) => void;
  onEmployerAccess?: () => void;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget?: string;
  deadline?: string;
  skills: string[];
  status: string;
  employerName: string;
  createdAt: string;
}

interface Post {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export function PublicHome({ onLogin, onEmployerAccess }: PublicHomeProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchPosts();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleApplyClick = (project: Project) => {
    setSelectedProject(project);
    setIsAuthDialogOpen(true);
  };

  const handleLoginSuccess = (user: any, accessToken: string) => {
    setIsAuthDialogOpen(false);
    onLogin(user, accessToken);
  };

  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.skills.some(skill => skill.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Tarakki
                </h1>
                <p className="text-xs text-gray-600">Empowering careers, building futures</p>
              </div>
            </div>
            <Button onClick={() => setIsAuthDialogOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-600">
              <LogIn className="h-4 w-4 mr-2" />
              Login / Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Find Your Next Opportunity</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Discover Amazing{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Projects
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with exciting opportunities and grow your career with Tarakki
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title, description, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-purple-200"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Card className="bg-white/60 backdrop-blur-sm border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{projects.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Active Projects</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/60 backdrop-blur-sm border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-pink-600">{posts.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Community Posts</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/60 backdrop-blur-sm border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">24/7</p>
                    <p className="text-sm text-gray-600 mt-1">Support Available</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-6 max-w-5xl mx-auto">
              {filteredProjects.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      {searchQuery ? 'No projects match your search.' : 'No projects available at the moment.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredProjects.map((project) => (
                  <Card key={project.id} className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-purple-100">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-2">
                            <span className="font-medium text-purple-600">{project.employerName}</span>
                            <span className="text-gray-400">•</span>
                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                          </CardDescription>
                          <p className="text-gray-700 mt-3 leading-relaxed">{project.description}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200">{project.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {project.budget && (
                          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">{project.budget}</span>
                          </div>
                        )}
                        {project.deadline && (
                          <div className="flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-lg">
                            <Calendar className="h-4 w-4 text-pink-600" />
                            <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {project.skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {project.skills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <Button 
                          onClick={() => handleApplyClick(project)}
                          className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          Apply for Project
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="feed" className="space-y-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {posts.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">No posts yet. Check back later!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="bg-white/80 backdrop-blur-sm border-purple-100">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {post.authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-base">{post.authorName}</CardTitle>
                          <CardDescription>
                            {new Date(post.createdAt).toLocaleDateString()} at{' '}
                            {new Date(post.createdAt).toLocaleTimeString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Auth Dialog */}
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to continue</DialogTitle>
            <DialogDescription>
              {selectedProject 
                ? `Login or create an account to apply for "${selectedProject.title}"`
                : 'Create an account or login to access all features'}
            </DialogDescription>
          </DialogHeader>
          <AuthPage onLogin={handleLoginSuccess} onClose={() => setIsAuthDialogOpen(false)} isModal={true} />
        </DialogContent>
      </Dialog>
    </div>
  );
}