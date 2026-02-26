import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { API_BASE_URL } from '../lib/supabase';
import { Briefcase, LogOut, DollarSign, Calendar, MessageSquare, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';

interface ContractorDashboardProps {
  user: any;
  accessToken: string;
  onLogout: () => void;
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

export function ContractorDashboard({ user, accessToken, onLogout }: ContractorDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchPosts();
  }, []);

 //
const fetchProjects = async () => {
  // ... similar try/catch structure as above ...
  const dummyProjects: Project[] = [
    {
      id: 'c1',
      title: 'Mobile App Development',
      description: 'Looking for a Flutter expert to build a delivery app.',
      budget: '$5000',
      deadline: '2025-01-15',
      skills: ['Flutter', 'Firebase'],
      status: 'open',
      employerName: 'TechCorp',
      createdAt: new Date().toISOString()
    }
  ];
  // Logic to setProjects with data or dummyProjects
};

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Tarakki</h1>
                <p className="text-sm text-gray-500">
                  {user.userType === 'startup' ? 'Startup' : 'Contractor'} Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.userType}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">Available Projects</TabsTrigger>
            <TabsTrigger value="feed">Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available Projects</h2>
                <p className="text-gray-600">Browse and apply for projects that match your skills</p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, description, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      {searchQuery ? 'No projects match your search.' : 'No projects available at the moment.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{project.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Posted by {project.employerName}
                          </CardDescription>
                          <p className="text-gray-700 mt-3">{project.description}</p>
                        </div>
                        <Badge>{project.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {project.budget && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">{project.budget}</span>
                          </div>
                        )}
                        {project.deadline && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {project.skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {project.skills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <Button className="w-full sm:w-auto">Apply for Project</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="feed" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Community Feed</h2>
              <p className="text-gray-600">Updates and announcements from employers</p>
            </div>

            <div className="grid gap-4">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">No posts yet. Check back later!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
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
                      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}