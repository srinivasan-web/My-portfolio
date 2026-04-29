import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Star,
  GitFork,
  Code,
  ExternalLink,
  RefreshCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGitHubActivity } from "@/hooks/useGitHubActivity";

interface GitHubActivityProps {
  username: string;
}

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-500",
  Python: "bg-green-500",
  Rust: "bg-orange-500",
  Go: "bg-cyan-500",
  Java: "bg-red-500",
  Dart: "bg-sky-400",
  Swift: "bg-orange-400",
  Kotlin: "bg-purple-500",
  Shell: "bg-slate-500",
  HTML: "bg-rose-500",
  CSS: "bg-cyan-800",
  default: "bg-muted-foreground",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const renderLangBadge = (language?: string) => {
  if (!language) return null;
  return (
    <Badge variant="outline" className="text-xs">
      <span
        className={`inline-block w-2 h-2 mr-2 rounded-full ${languageColors[language] || languageColors.default}`}
      />
      {language}
    </Badge>
  );
};

export const GitHubActivity = ({ username }: GitHubActivityProps) => {
  const { profile, repos, events, stats, isLoading, error, refresh } =
    useGitHubActivity(username);

  const topRepos = useMemo(
    () =>
      repos
        .slice()
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6),
    [repos],
  );

  const recentRepos = useMemo(
    () =>
      repos
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        )
        .slice(0, 5),
    [repos],
  );

  const topLanguages = useMemo(() => {
    if (stats?.top_languages && stats.top_languages.length) {
      return stats.top_languages;
    }

    const counts = repos.reduce<Record<string, number>>((acc, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([language, count]) => ({ language, count }));
  }, [repos, stats]);

  if (isLoading) {
    return (
      <section id="github" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              GitHub <span className="text-primary">Activity</span>
            </h2>
            <p className="text-muted-foreground mt-3">
              Loading latest repositories and stats...
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((key) => (
              <Card key={key} className="space-y-4 p-6">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section id="github" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="border-red-200 bg-red-50 p-6">
            <CardHeader>
              <CardTitle className="text-lg text-red-700">
                Unable to load GitHub activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600 mb-4">
                {error || "There was a problem fetching GitHub data."}
              </p>
              <Button
                variant="outline"
                onClick={refresh}
                className="inline-flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" /> Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="github" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-primary/80 mb-3">
            GitHub Live Feed
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Latest work from{" "}
            <span className="text-gradient">{profile.login}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Dynamic repository highlights, activity summaries, and language
            insights pulled directly from GitHub.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] mb-8">
          <Card className="overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6">
              <img
                src={profile.avatar_url}
                alt={profile.login}
                className="h-28 w-28 rounded-full ring-2 ring-primary/20 object-cover"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-semibold">
                  {profile.name || profile.login}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {profile.bio || "GitHub profile summary"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>{profile.public_repos} repositories</span>
                  <span>• {profile.followers} followers</span>
                  <span>• {profile.following} following</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4">
            {[
              {
                label: "Repositories",
                value: stats?.public_repos ?? profile.public_repos,
                icon: Code,
              },
              { label: "Stars", value: stats?.total_stars ?? 0, icon: Star },
              { label: "Forks", value: stats?.total_forks ?? 0, icon: GitFork },
              { label: "Followers", value: profile.followers, icon: Github },
            ].map((item) => (
              <Card key={item.label} className="glass border-0">
                <CardContent className="p-5 text-center">
                  <item.icon className="mx-auto mb-3 h-5 w-5 text-primary" />
                  <div className="text-2xl font-semibold">{item.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Featured repositories</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {topRepos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No repositories available right now.
                </p>
              ) : (
                topRepos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-3xl border border-border/80 p-5 transition hover:border-primary/70 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold truncate group-hover:text-primary">
                          {repo.name}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground truncate">
                          {repo.description || "No description available."}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {renderLangBadge(repo.language)}
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3" /> {repo.stargazers_count}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GitFork className="h-3 w-3" /> {repo.forks_count}
                      </span>
                      <span>{formatDate(repo.updated_at)}</span>
                    </div>
                  </a>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Language insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {topLanguages.length === 0 ? (
                  <Badge variant="secondary">No language data</Badge>
                ) : (
                  topLanguages.map(({ language, count }) => (
                    <Badge
                      key={language}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${languageColors[language] || languageColors.default}`}
                      />
                      {language} ({count})
                    </Badge>
                  ))
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold">Recent activity</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Latest commits, pull requests, and repository updates from the
                  GitHub feed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Most recently updated</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRepos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-3xl border border-border/80 p-4 transition hover:border-primary/70 hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold truncate">{repo.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {repo.description || "No description"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(repo.updated_at)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {renderLangBadge(repo.language)}
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3" /> {repo.stargazers_count}
                    </span>
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GitHub activity feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent activity to show.
                </p>
              ) : (
                events.slice(0, 6).map((event) => (
                  <div
                    key={event.id}
                    className="rounded-3xl border border-border/80 p-4 transition hover:border-primary/70 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {event.description}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {event.repo}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(event.date)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="secondary"
            onClick={refresh}
            className="inline-flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" asChild>
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Github className="h-4 w-4" /> View full profile
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};
