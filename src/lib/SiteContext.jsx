import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import { seedProjects } from '../../server/data/projectsSeedData.js';
import { defaultProfile } from '../../server/data/profileDefaults.js';
import bundledResume from '../../resume.pdf';

const SiteContext = createContext(null);

// The site renders immediately from the bundled defaults, then swaps in live data from the API.
export function SiteProvider({ children }) {
  const [profile, setProfile] = useState(defaultProfile);
  const [projects, setProjects] = useState(seedProjects);
  const [posts, setPosts] = useState([]);

  const refresh = useCallback(async () => {
    const [p, pr, b] = await Promise.allSettled([
      api('/api/profile'),
      api('/api/projects'),
      api('/api/blogs')
    ]);
    if (p.status === 'fulfilled') setProfile({ ...defaultProfile, ...p.value.data });
    if (pr.status === 'fulfilled' && pr.value.data?.length) setProjects(pr.value.data);
    if (b.status === 'fulfilled') setPosts(b.value.data || []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      profile,
      projects: [...projects].sort((a, b) => (a.order || 0) - (b.order || 0)),
      posts,
      resumeUrl: profile.resumeUrl || bundledResume,
      refresh
    }),
    [profile, projects, posts, refresh]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
