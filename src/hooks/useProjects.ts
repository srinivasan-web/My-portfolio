import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  image_url: string | null;
  category: string;
  tags: string[];
  features: string[];
  github_url: string | null;
  live_url: string | null;
  views: number | null;
  is_published: boolean;
  created_at: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProjects(data || []);
    }
    setIsLoading(false);
  };

  const incrementViews = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      await supabase
        .from("projects")
        .update({ views: (project.views || 0) + 1 })
        .eq("id", projectId);
    }
  };

  return { projects, isLoading, error, refetch: fetchProjects, incrementViews };
};
