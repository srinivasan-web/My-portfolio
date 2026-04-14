import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, MessageSquare, FolderKanban, Users, 
  FileText, Star, Mail, LogOut, Menu, X, Eye, Trash2,
  CheckCircle, Clock, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type TabType = "overview" | "messages" | "projects" | "testimonials" | "blog" | "subscribers";

interface Stats {
  messages: number;
  projects: number;
  testimonials: number;
  subscribers: number;
  blogPosts: number;
}

const Admin = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({ messages: 0, projects: 0, testimonials: 0, subscribers: 0, blogPosts: 0 });
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    // Fetch all data
    const [messagesRes, projectsRes, testimonialsRes, subscribersRes, blogRes] = await Promise.all([
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("testimonials").select("*").order("created_at", { ascending: false }),
      supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false }),
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
    ]);

    if (messagesRes.data) setMessages(messagesRes.data);
    if (projectsRes.data) setProjects(projectsRes.data);
    if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    if (subscribersRes.data) setSubscribers(subscribersRes.data);
    if (blogRes.data) setBlogPosts(blogRes.data);

    setStats({
      messages: messagesRes.data?.length || 0,
      projects: projectsRes.data?.length || 0,
      testimonials: testimonialsRes.data?.length || 0,
      subscribers: subscribersRes.data?.length || 0,
      blogPosts: blogRes.data?.length || 0,
    });
  };

  const markMessageRead = async (id: string) => {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    fetchData();
    toast({ title: "Message marked as read" });
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    fetchData();
    toast({ title: "Message deleted" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: LayoutDashboard },
    { id: "messages" as TabType, label: "Messages", icon: MessageSquare, count: stats.messages },
    { id: "projects" as TabType, label: "Projects", icon: FolderKanban, count: stats.projects },
    { id: "testimonials" as TabType, label: "Testimonials", icon: Star, count: stats.testimonials },
    { id: "blog" as TabType, label: "Blog Posts", icon: FileText, count: stats.blogPosts },
    { id: "subscribers" as TabType, label: "Subscribers", icon: Mail, count: stats.subscribers },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
        <span className="font-bold">Admin Dashboard</span>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 transition-transform lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-border">
          <Link to="/" className="text-xl font-bold text-gradient">Portfolio Admin</Link>
        </div>
        
        <nav className="p-4 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </div>
              {tab.count !== undefined && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeTab === tab.id ? "bg-primary-foreground/20" : "bg-muted"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {activeTab === "overview" && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Messages", value: stats.messages, icon: MessageSquare, color: "bg-blue-500" },
                    { label: "Projects", value: stats.projects, icon: FolderKanban, color: "bg-green-500" },
                    { label: "Testimonials", value: stats.testimonials, icon: Star, color: "bg-yellow-500" },
                    { label: "Subscribers", value: stats.subscribers, icon: Mail, color: "bg-purple-500" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-card border border-border rounded-xl p-6">
                      <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "messages" && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-muted-foreground">No messages yet.</p>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={`bg-card border rounded-xl p-6 ${!msg.is_read ? "border-primary" : "border-border"}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {msg.name}
                              {!msg.is_read && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">New</span>}
                            </h3>
                            <p className="text-sm text-muted-foreground">{msg.email}</p>
                          </div>
                          <div className="flex gap-2">
                            {!msg.is_read && (
                              <Button size="sm" variant="outline" onClick={() => markMessageRead(msg.id)}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => deleteMessage(msg.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="font-medium mb-2">{msg.subject}</p>
                        <p className="text-muted-foreground">{msg.message}</p>
                        <p className="text-xs text-muted-foreground mt-4">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "projects" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Projects</h1>
                  <Button className="gradient-primary text-primary-foreground">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Project
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(project => (
                    <div key={project.id} className="bg-card border border-border rounded-xl overflow-hidden">
                      {project.image_url && (
                        <img src={project.image_url} alt={project.title} className="w-full h-40 object-cover" />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">{project.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{project.views || 0}</span>
                          <span className={project.is_published ? "text-green-500" : "text-yellow-500"}>
                            {project.is_published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "testimonials" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Testimonials</h1>
                  <Button className="gradient-primary text-primary-foreground">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Testimonial
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {testimonials.map(t => (
                    <div key={t.id} className="bg-card border border-border rounded-xl p-6">
                      <p className="italic mb-4">"{t.content}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{t.name}</p>
                          <p className="text-sm text-muted-foreground">{t.role} at {t.company}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "blog" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Blog Posts</h1>
                  <Button className="gradient-primary text-primary-foreground">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Post
                  </Button>
                </div>
                <div className="space-y-4">
                  {blogPosts.map(post => (
                    <div key={post.id} className="bg-card border border-border rounded-xl p-6 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{post.views || 0}</span>
                        <span className={post.is_published ? "text-green-500" : "text-yellow-500"}>
                          {post.is_published ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "subscribers" && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Newsletter Subscribers</h1>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map(sub => (
                        <tr key={sub.id} className="border-t border-border">
                          <td className="p-4">{sub.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${sub.is_active ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                              {sub.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(sub.subscribed_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Admin;
