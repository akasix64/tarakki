import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { API_BASE_URL } from '../lib/supabase';
import { publicAnonKey } from '/utils/supabase/info';
import { Briefcase, DollarSign, Calendar, MessageSquare, Search, LogIn, TrendingUp, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { AuthPage } from './auth-page';

interface PublicHomeProps {
  onLogin: (user: any, accessToken: string) => void;
  onEmployerAccess?: () => void; // This prop triggers the view change in App.tsx
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
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      
      const egisedgeProjects: Project[] = [
        {
          id: 'e-p1',
          title: 'Full-Stack Web Application',
          description: 'Egisedge is looking for a developer to build a modern dashboard for internal analytics.',
          budget: '$3,500',
          deadline: '2024-12-15',
          skills: ['React', 'Node.js', 'PostgreSQL'],
          status: 'open',
          employerName: 'Egisedge',
          createdAt: new Date().toISOString()
        },
        {
          id: 'e-p2',
          title: 'Corporate Identity Design',
          description: 'Help Egisedge refresh its brand with a new logo and marketing collateral.',
          budget: '$1,800',
          deadline: '2024-11-30',
          skills: ['Illustrator', 'Figma', 'Branding'],
          status: 'open',
          employerName: 'Egisedge',
          createdAt: new Date().toISOString()
        },
        {
          id: 'e-p3',
          title: 'Cloud Infrastructure Audit',
          description: 'AWS specialist needed to optimize our cloud spending and security protocols.',
          budget: '$2,000',
          deadline: '2024-12-05',
          skills: ['AWS', 'DevOps', 'Terraform'],
          status: 'open',
          employerName: 'Egisedge',
          createdAt: new Date().toISOString()
      }
      ];

      const fetchedProjects = response.ok ? data.projects.map((p: Project) => ({ ...p, employerName: 'Egisedge' })) : [];
      setProjects([...fetchedProjects, ...egisedgeProjects]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();

      const egisedgePosts: Post[] = [
        {
          id: 'e-post1',
          content: 'Egisedge is expanding! Check out our new project listings for Q4.',
          authorName: 'Egisedge',
          createdAt: new Date().toISOString()
        },

      {
        id: 'e-post2',
        content: 'We prioritize quality and long-term partnerships with our contractors. Join us today!',
        authorName: 'Egisedge',
        createdAt: new Date().toISOString()
      },

      {
        id: 'e-post3',
        content: 'Great news: Our latest project "Cloud Audit" is now open for bidding.',
        authorName: 'Egisedge',
        createdAt: new Date().toISOString()
      }
      ];

      const fetchedPosts = response.ok ? data.posts.map((p: Post) => ({ ...p, authorName: 'Egisedge' })) : [];
      setPosts([...fetchedPosts, ...egisedgePosts]);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col">
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
            <Button onClick={() => setIsAuthDialogOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none shadow-md">
              <LogIn className="h-4 w-4 mr-2" />
              Login / Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 shadow-sm">
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
            Connect with exciting opportunities and grow your career with Tarakki.
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/60 backdrop-blur-sm border border-purple-100 shadow-sm">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6 outline-none">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title, description, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 transition-all shadow-sm"
              />
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[
                { label: 'Active Projects', count: projects.length, color: 'text-purple-600' },
                { label: 'Community Posts', count: posts.length, color: 'text-pink-600' },
                { label: 'Support', count: '24/7', color: 'text-orange-600' }
              ].map((stat, i) => (
                <Card key={i} className="bg-white/60 backdrop-blur-sm border-purple-100 shadow-sm">
                  <CardContent className="pt-6 text-center">
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.count}</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Projects Grid */}
            <div className="grid gap-6 max-w-5xl mx-auto">
              {filteredProjects.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm py-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No projects match your search.</p>
                </Card>
              ) : (
                filteredProjects.map((project) => (
                  <Card key={project.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all border-purple-100 group">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-purple-700 transition-colors">{project.title}</CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-2">
                            <span className="font-semibold text-purple-600">{project.employerName}</span>
                            <span className="text-gray-300">•</span>
                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                          </CardDescription>
                          <p className="text-gray-700 mt-3 leading-relaxed">{project.description}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200 capitalize">{project.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-4 text-sm">
                        {project.budget && (
                          <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold">{project.budget}</span>
                          </div>
                        )}
                        {project.deadline && (
                          <div className="flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-lg border border-pink-100">
                            <Calendar className="h-4 w-4" />
                            <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-white border-purple-100 text-purple-600">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        onClick={() => handleApplyClick(project)}
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white mt-2"
                      >
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="feed" className="space-y-6 outline-none">
            <div className="max-w-3xl mx-auto space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
                        {post.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">{post.authorName}</CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer with Private Portal Link */}
      <footer className="mt-12 py-8 bg-white/40 border-t border-purple-100 text-center">
        <p className="text-sm text-gray-500 mb-4">© 2024 Tarakki. All rights reserved.</p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onEmployerAccess}
          className="text-gray-400 hover:text-purple-600 transition-colors gap-2"
        >
          <ShieldCheck className="h-4 w-4" />
          Employer Portal
        </Button>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent">
          <AuthPage 
            onLogin={handleLoginSuccess} 
            onClose={() => setIsAuthDialogOpen(false)} 
            isModal={true} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}