import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWaitlistStatus } from '../hooks/useWaitlistStatus';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Dashboard.css';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  private: boolean;
}

interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
}

const Dashboard: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { isAccepted, loading } = useWaitlistStatus(currentUser?.uid);
  
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [repoContents, setRepoContents] = useState<RepoFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingContents, setLoadingContents] = useState(false);

  // Load GitHub token from Firestore
  useEffect(() => {
    const loadGitHubToken = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setGithubToken(data.githubToken || null);
          setGithubUsername(data.githubUsername || null);
        }
      } catch (error) {
        console.error('Error loading GitHub token:', error);
      }
    };
    
    loadGitHubToken();
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLinkGitHub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/dashboard`;
    const scope = 'repo read:user';
    
    // Store current user ID to retrieve after OAuth
    sessionStorage.setItem('github_oauth_uid', currentUser?.uid || '');
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const handleGitHubCallback = async (code: string) => {
    try {
      // Exchange code for token using Cloud Function
      const response = await fetch('https://githuboauth-kjwzbgfdmq-uc.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloud Function error:', errorData);
        alert(`GitHub authentication failed: ${errorData.error || 'Unknown error'}`);
        return;
      }
      
      const data = await response.json();
      console.log('Cloud Function response:', data);
      
      if (!data.access_token) {
        console.error('No access token in response:', data);
        alert('Failed to get GitHub access token. Please try again.');
        return;
      }
      
      // Get GitHub user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      const githubUser = await userResponse.json();
      
      if (!githubUser.login) {
        console.error('Failed to get GitHub user info:', githubUser);
        alert('Failed to get GitHub user information. Please try again.');
        return;
      }
      
      // Save to Firestore
      if (currentUser?.uid) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          githubToken: data.access_token,
          githubUsername: githubUser.login
        }, { merge: true });
        
        setGithubToken(data.access_token);
        setGithubUsername(githubUser.login);
        alert('GitHub account connected successfully!');
      }
    } catch (error) {
      console.error('Error handling GitHub callback:', error);
      alert('An error occurred while connecting GitHub. Check console for details.');
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code && !githubToken) {
      handleGitHubCallback(code);
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const fetchRepos = async () => {
    if (!githubToken) return;
    
    setLoadingRepos(true);
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: { 'Authorization': `Bearer ${githubToken}` }
      });
      const data = await response.json();
      setRepos(data);
    } catch (error) {
      console.error('Error fetching repos:', error);
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchRepoContents = async (repo: GitHubRepo, path: string = '') => {
    if (!githubToken) return;
    
    setLoadingContents(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/contents/${path}`,
        { headers: { 'Authorization': `Bearer ${githubToken}` } }
      );
      const data = await response.json();
      setRepoContents(Array.isArray(data) ? data : []);
      setCurrentPath(path);
      setFileContent(null);
    } catch (error) {
      console.error('Error fetching repo contents:', error);
    } finally {
      setLoadingContents(false);
    }
  };

  const fetchFileContent = async (repo: GitHubRepo, path: string) => {
    if (!githubToken) return;
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/contents/${path}`,
        { headers: { 'Authorization': `Bearer ${githubToken}` } }
      );
      const data = await response.json();
      
      if (data.content) {
        const decoded = atob(data.content);
        setFileContent(decoded);
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  };

  const handleRepoSelect = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    fetchRepoContents(repo);
  };

  const handleItemClick = (item: RepoFile) => {
    if (!selectedRepo) return;
    
    if (item.type === 'dir') {
      fetchRepoContents(selectedRepo, item.path);
    } else {
      fetchFileContent(selectedRepo, item.path);
    }
  };

  const handleBackToRepos = () => {
    setSelectedRepo(null);
    setRepoContents([]);
    setCurrentPath('');
    setFileContent(null);
  };

  const handleNavigateUp = () => {
    if (!selectedRepo || !currentPath) return;
    
    const pathParts = currentPath.split('/').filter(p => p);
    pathParts.pop();
    const newPath = pathParts.join('/');
    fetchRepoContents(selectedRepo, newPath);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  // Waitlist screen
  if (!isAccepted) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card waitlist-card">
          <div className="waitlist-content">
            <h1>Thank You for Joining the Waitlist</h1>
            <p className="waitlist-message">
              We'll let you know when you are in.
            </p>
            {currentUser?.photoURL && (
              <img 
                src={currentUser.photoURL} 
                alt="User avatar" 
                className="user-avatar"
              />
            )}
            <div className="user-details">
              <h2>{currentUser?.displayName || 'User'}</h2>
              <p className="user-email">{currentUser?.email}</p>
            </div>
            <div className="dashboard-actions">
              <button onClick={handleSignOut} className="signout-button">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Actual dashboard for accepted users
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header-bar">
          <h1>Dashboard</h1>
        </div>

        {/* GitHub Integration */}
        <div className="dashboard-content">
          {!githubToken ? (
            <div className="github-section">
              <h2>🔗 Link GitHub Account</h2>
              <p>Connect your GitHub account to browse your repositories.</p>
              <button onClick={handleLinkGitHub} className="github-button">
                Connect GitHub
              </button>
            </div>
          ) : (
            <div className="github-section">
              <div className="github-header">
                <h2>📦 GitHub Repositories</h2>
                <p className="github-username">@{githubUsername}</p>
              </div>
              
              {!selectedRepo ? (
                <div className="repos-list">
                  {repos.length === 0 ? (
                    <button 
                      onClick={fetchRepos} 
                      className="fetch-button"
                      disabled={loadingRepos}
                    >
                      {loadingRepos ? 'Loading...' : 'Load Repositories'}
                    </button>
                  ) : (
                    <>
                      <div className="repos-count">{repos.length} repositories</div>
                      <div className="repos-grid">
                        {repos.map(repo => (
                          <div 
                            key={repo.id} 
                            className="repo-card"
                            onClick={() => handleRepoSelect(repo)}
                          >
                            <h3>{repo.name}</h3>
                            {repo.description && (
                              <p className="repo-description">{repo.description}</p>
                            )}
                            <div className="repo-meta">
                              {repo.private && <span className="private-badge">Private</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="repo-browser">
                  <div className="browser-header">
                    <button onClick={handleBackToRepos} className="back-button">
                      ← Back to Repos
                    </button>
                    <h3>{selectedRepo.name}</h3>
                  </div>
                  
                  {currentPath && (
                    <div className="breadcrumb">
                      <button onClick={handleNavigateUp} className="up-button">
                        ↑ Up
                      </button>
                      <span className="current-path">/{currentPath}</span>
                    </div>
                  )}
                  
                  {loadingContents ? (
                    <div className="loading">Loading contents...</div>
                  ) : fileContent ? (
                    <div className="file-viewer">
                      <pre><code>{fileContent}</code></pre>
                    </div>
                  ) : (
                    <div className="contents-list">
                      {repoContents.map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`content-item ${item.type}`}
                          onClick={() => handleItemClick(item)}
                        >
                          <span className="item-icon">
                            {item.type === 'dir' ? '📁' : '📄'}
                          </span>
                          <span className="item-name">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add your actual dashboard content here */}
        <div className="dashboard-content">
          <h2>Dashboard Content</h2>
          <p>This is where your main dashboard features will go.</p>
        </div>

        {/* Add your actual dashboard content here */}
        <div className="dashboard-content">
          <h2>Dashboard Content</h2>
          <p>This is where your main dashboard features will go.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
