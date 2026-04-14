import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GitHubProfile {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
}

interface GitHubEvent {
  id: string;
  type: string;
  repo: string;
  date: string;
  description: string;
}

interface GitHubStats {
  public_repos: number;
  followers: number;
  following: number;
  total_stars: number;
  total_forks: number;
  top_languages: { language: string; count: number }[];
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export const useGitHubActivity = (username: string | null) => {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (type: string) => {
    if (!username) return null;
    
    try {
      const { data, error } = await supabase.functions.invoke("github-activity", {
        body: { username, type },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`GitHub ${type} error:`, err);
      return null;
    }
  }, [username]);

  const fetchAll = useCallback(async () => {
    if (!username) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const [profileData, reposData, eventsData, statsData] = await Promise.all([
        fetchData("profile"),
        fetchData("repos"),
        fetchData("events"),
        fetchData("stats"),
      ]);

      if (profileData && !profileData.error) setProfile(profileData);
      if (reposData && !reposData.error) setRepos(reposData);
      if (eventsData && !eventsData.error) setEvents(eventsData);
      if (statsData && !statsData.error) setStats(statsData);
    } catch (err) {
      setError("Failed to fetch GitHub data");
    } finally {
      setIsLoading(false);
    }
  }, [username, fetchData]);

  const fetchContributions = useCallback(async () => {
    if (!username) return;
    
    const data = await fetchData("contributions");
    if (data && !data.error) {
      setContributions(data);
    }
  }, [username, fetchData]);

  useEffect(() => {
    if (username) {
      fetchAll();
    }
  }, [username, fetchAll]);

  return {
    profile,
    repos,
    events,
    stats,
    contributions,
    isLoading,
    error,
    refresh: fetchAll,
    fetchContributions,
  };
};
