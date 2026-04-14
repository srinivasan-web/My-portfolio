import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
}

export const useAIAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);

  const recommendProjects = useCallback(async (
    interests: string,
    viewedProjects: string[],
    projects: Project[]
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "recommend-projects",
          data: { interests, viewedProjects, projects },
        },
      });

      if (error) throw error;
      return data.result;
    } catch (error) {
      console.error("AI recommendation error:", error);
      toast({
        title: "AI Error",
        description: "Failed to get project recommendations",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const matchSkills = useCallback(async (requirements: string, skills: string[]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "skill-match",
          data: { requirements, skills },
        },
      });

      if (error) throw error;
      
      // Try to parse JSON from the result
      try {
        return JSON.parse(data.result);
      } catch {
        return { summary: data.result };
      }
    } catch (error) {
      console.error("Skill match error:", error);
      toast({
        title: "AI Error",
        description: "Failed to analyze skill match",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const summarizeProject = useCallback(async (
    title: string,
    description: string,
    technologies: string[]
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "summarize-project",
          data: { title, description, technologies },
        },
      });

      if (error) throw error;
      return data.result;
    } catch (error) {
      console.error("Project summary error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const chat = useCallback(async (message: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "chat",
          data: { message },
        },
      });

      if (error) throw error;
      return data.result;
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "AI Error",
        description: "Failed to get response",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    recommendProjects,
    matchSkills,
    summarizeProject,
    chat,
  };
};
