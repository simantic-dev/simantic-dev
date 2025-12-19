import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
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

interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
  html_url: string;
}

interface Branch {
  name: string;
  commit: {
    sha: string;
  };
}

interface TestRun {
  id: string;
  commitSha: string;
  commitMessage: string;
  status: 'running' | 'passed' | 'failed';
  timestamp: string;
  duration?: number;
  logs?: string;
}

const Dashboard: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { owner, repo, '*': filePath } = useParams<{ owner: string; repo: string; '*': string }>();
  const { isAccepted, loading } = useWaitlistStatus(currentUser?.uid);
  
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [configuredRepos, setConfiguredRepos] = useState<GitHubRepo[]>([]);
  const [otherRepos, setOtherRepos] = useState<GitHubRepo[]>([]);
  const [pinnedRepoIds, setPinnedRepoIds] = useState<number[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [repoContents, setRepoContents] = useState<RepoFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [defaultBranch, setDefaultBranch] = useState<string>('');
  const [commitHistory, setCommitHistory] = useState<CommitInfo[]>([]);
  const [testHistory, setTestHistory] = useState<TestRun[]>([]);
  const [hasSimanticFile, setHasSimanticFile] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingContents, setLoadingContents] = useState(false);
  const [loadingCommits, setLoadingCommits] = useState(false);

  // Load GitHub token and pinned repos from Firestore
  useEffect(() => {
    const loadGitHubData = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setGithubToken(data.githubToken || null);
          setGithubUsername(data.githubUsername || null);
          setPinnedRepoIds(data.pinnedRepoIds || []);
        }
      } catch (error) {
        console.error('Error loading GitHub data:', error);
      }
    };
    
    loadGitHubData();
  }, [currentUser]);

  // Load repo from URL params if present
  useEffect(() => {
    if (owner && repo && githubToken && !selectedRepo) {
      const fullName = `${owner}/${repo}`;
      const repoData: GitHubRepo = {
        id: 0,
        name: repo,
        full_name: fullName,
        description: '',
        html_url: `https://github.com/${fullName}`,
        private: false
      };
      setSelectedRepo(repoData);
      setCommitHistory([]);
      setBranches([]);
      setSelectedBranch('');
      setHasSimanticFile(false);
      
      // Load the path from URL
      if (filePath) {
        // Check if it's a file by trying to fetch it
        fetchFileContent(repoData, filePath);
        fetchRepoContents(repoData, filePath.split('/').slice(0, -1).join('/'));
      } else {
        fetchRepoContents(repoData);
      }
      
      fetchBranches(repoData);
      checkForSimanticFile(repoData);
    } else if (!owner && !repo && selectedRepo) {
      setSelectedRepo(null);
      setRepoContents([]);
      setCurrentPath('');
      setFileContent(null);
      setCommitHistory([]);
      setBranches([]);
      setSelectedBranch('');
      setHasSimanticFile(false);
    }
  }, [owner, repo, githubToken]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchRepos = async () => {
    if (!githubToken || !githubUsername) return;
    
    setLoadingRepos(true);
    try {
      // Fetch all repos
      const allReposResponse = await fetch(
        'https://api.github.com/user/repos?sort=updated&per_page=100',
        { headers: { 'Authorization': `Bearer ${githubToken}` } }
      );
      const allRepos = await allReposResponse.json();
      
      // Use GitHub search API to find repos with .simantic file
      const searchQuery = `filename:.simantic user:${githubUsername}`;
      const searchResponse = await fetch(
        `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=100`,
        { headers: { 'Authorization': `Bearer ${githubToken}` } }
      );
      const searchData = await searchResponse.json();
      
      // Extract unique repository IDs with .simantic
      const configuredRepoIds = new Set<number>();
      if (searchData.items) {
        searchData.items.forEach((item: any) => {
          if (item.repository) {
            configuredRepoIds.add(item.repository.id);
          }
        });
      }
      
      // Separate repos into configured and other
      const configured: GitHubRepo[] = [];
      const other: GitHubRepo[] = [];
      
      allRepos.forEach((repo: any) => {
        const repoData = {
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          private: repo.private
        };
        
        if (configuredRepoIds.has(repo.id)) {
          configured.push(repoData);
        } else {
          other.push(repoData);
        }
      });
      
      setConfiguredRepos(configured);
      setOtherRepos(other);
    } catch (error) {
      console.error('Error fetching repos:', error);
    } finally {
      setLoadingRepos(false);
    }
  };

  // Auto-fetch repos when GitHub token is available
  useEffect(() => {
    if (githubToken && configuredRepos.length === 0 && otherRepos.length === 0 && !loadingRepos) {
      fetchRepos();
    }
  }, [githubToken]);

  const togglePinRepo = async (repoId: number) => {
    if (!currentUser?.uid) return;
    
    const newPinnedIds = pinnedRepoIds.includes(repoId)
      ? pinnedRepoIds.filter(id => id !== repoId)
      : [...pinnedRepoIds, repoId];
    
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        pinnedRepoIds: newPinnedIds
      }, { merge: true });
      
      setPinnedRepoIds(newPinnedIds);
    } catch (error) {
      console.error('Error updating pinned repos:', error);
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

  const fetchBranches = async (repo: GitHubRepo) => {
    if (!githubToken) return;
    
    try {
      // Get repo details to find default branch
      const repoResponse = await fetch(
        `https://api.github.com/repos/${repo.full_name}`,
        { headers: { 'Authorization': `Bearer ${githubToken}` } }
      );
      const repoData = await repoResponse.json();
      const defaultBranchName = repoData.default_branch || 'main';
      setDefaultBranch(defaultBranchName);
      setSelectedBranch(defaultBranchName);
      
      // Fetch all branches
      const branchesResponse = await fetch(
        `https://api.github.com/repos/${repo.full_name}/branches`,
        { headers: { 'Authorization': `Bearer ${githubToken}` } }
      );
      const branchesData = await branchesResponse.json();
      setBranches(branchesData);
      
      // Fetch commits for default branch
      fetchCommitHistory(repo, defaultBranchName);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchCommitHistory = async (repo: GitHubRepo, branch: string) => {
    if (!githubToken) return;
    
    setLoadingCommits(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/commits?sha=${branch}&per_page=50`,
        { headers: { 'Authorization': `Bearer ${githubToken}` } }
      );
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const commits = data.map((commit: any) => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          date: new Date(commit.commit.author.date).toLocaleString(),
          html_url: commit.html_url
        }));
        setCommitHistory(commits);
      }
    } catch (error) {
      console.error('Error fetching commit history:', error);
    } finally {
      setLoadingCommits(false);
    }
  };

  const checkForSimanticFile = async (repo: GitHubRepo) => {
    if (!githubToken) return;
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/contents/.simantic`,
        { headers: { 'Authorization': `Bearer ${githubToken}` } }
      );
      setHasSimanticFile(response.ok);
    } catch (error) {
      setHasSimanticFile(false);
    }
  };

  const handleRepoSelect = (repo: GitHubRepo) => {
    // Navigate to repo-specific page
    navigate(`/dashboard/${repo.full_name}`);
  };

  const handleBranchChange = (branch: string) => {
    if (!selectedRepo) return;
    setSelectedBranch(branch);
    fetchCommitHistory(selectedRepo, branch);
  };

  const handleItemClick = (item: RepoFile) => {
    if (!selectedRepo) return;
    
    if (item.type === 'dir') {
      fetchRepoContents(selectedRepo, item.path);
      navigate(`/dashboard/${selectedRepo.full_name}/${item.path}`);
    } else {
      fetchFileContent(selectedRepo, item.path);
      navigate(`/dashboard/${selectedRepo.full_name}/${item.path}`);
    }
  };

  const handleBackToRepos = () => {
    navigate('/dashboard');
  };

  const handleNavigateUp = () => {
    if (!selectedRepo || !currentPath) return;
    
    const pathParts = currentPath.split('/').filter(p => p);
    pathParts.pop();
    const newPath = pathParts.join('/');
    fetchRepoContents(selectedRepo, newPath);
    if (newPath) {
      navigate(`/dashboard/${selectedRepo.full_name}/${newPath}`);
    } else {
      navigate(`/dashboard/${selectedRepo.full_name}`);
    }
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
        {!selectedRepo && (
          <div className="dashboard-header-bar">
            <h1>Dashboard</h1>
          </div>
        )}

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
              {!selectedRepo && (
                <div className="github-header">
                  <h2>📦 GitHub Repositories</h2>
                  <p className="github-username">@{githubUsername}</p>
                </div>
              )}
              
              {!selectedRepo ? (
                <div className="repos-list">
                  {loadingRepos ? (
                    <div className="loading">Loading repositories...</div>
                  ) : configuredRepos.length === 0 && otherRepos.length === 0 ? (
                    <div className="loading">No repositories found</div>
                  ) : (
                    <>
                      {/* Pinned Section */}
                      {pinnedRepoIds.length > 0 && (
                        <div className="pinned-section">
                          <h3 className="section-title">📌 Pinned Repositories</h3>
                          <div className="repos-grid">
                            {[...configuredRepos, ...otherRepos]
                              .filter(repo => pinnedRepoIds.includes(repo.id))
                              .map(repo => (
                                <div 
                                  key={repo.id} 
                                  className="repo-card pinned"
                                >
                                  <div className="repo-card-content" onClick={() => handleRepoSelect(repo)}>
                                    <h3>{repo.name}</h3>
                                    {repo.description && (
                                      <p className="repo-description">{repo.description}</p>
                                    )}
                                    <div className="repo-meta">
                                      {repo.private && <span className="private-badge">Private</span>}
                                    </div>
                                  </div>
                                  <button 
                                    className="pin-button pinned"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePinRepo(repo.id);
                                    }}
                                    title="Unpin repository"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Configured Repositories Section */}
                      <div className="configured-repos-section">
                        <h3 className="section-title">⚙️ Configured Repositories ({configuredRepos.length})</h3>
                        <p className="section-description">
                          Repositories with a <code>.simantic</code> file. Newly created or configured repos can take time to appear here. 
                          You can pin any repo to override this check.
                        </p>
                        {configuredRepos.length > 0 ? (
                          <div className="repos-grid">
                            {configuredRepos.map(repo => (
                              <div 
                                key={repo.id} 
                                className={`repo-card ${pinnedRepoIds.includes(repo.id) ? 'is-pinned' : ''}`}
                              >
                                <div className="repo-card-content" onClick={() => handleRepoSelect(repo)}>
                                  <h3>{repo.name}</h3>
                                  {repo.description && (
                                    <p className="repo-description">{repo.description}</p>
                                  )}
                                  <div className="repo-meta">
                                    {repo.private && <span className="private-badge">Private</span>}
                                  </div>
                                </div>
                                <button 
                                  className={`pin-button ${pinnedRepoIds.includes(repo.id) ? 'pinned' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePinRepo(repo.id);
                                  }}
                                  title={pinnedRepoIds.includes(repo.id) ? 'Unpin repository' : 'Pin repository'}
                                >
                                  {pinnedRepoIds.includes(repo.id) ? '×' : '+'}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="empty-state">No configured repositories yet.</p>
                        )}
                      </div>
                      
                      {/* Other Repositories Section */}
                      {otherRepos.length > 0 && (
                        <div className="other-repos-section">
                          <h3 className="section-title">📁 Other Repositories ({otherRepos.length})</h3>
                          <div className="repos-grid">
                            {otherRepos.map(repo => (
                              <div 
                                key={repo.id} 
                                className={`repo-card ${pinnedRepoIds.includes(repo.id) ? 'is-pinned' : ''}`}
                              >
                                <div className="repo-card-content" onClick={() => handleRepoSelect(repo)}>
                                  <h3>{repo.name}</h3>
                                  {repo.description && (
                                    <p className="repo-description">{repo.description}</p>
                                  )}
                                  <div className="repo-meta">
                                    {repo.private && <span className="private-badge">Private</span>}
                                  </div>
                                </div>
                                <button 
                                  className={`pin-button ${pinnedRepoIds.includes(repo.id) ? 'pinned' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePinRepo(repo.id);
                                  }}
                                  title={pinnedRepoIds.includes(repo.id) ? 'Unpin repository' : 'Pin repository'}
                                >
                                  {pinnedRepoIds.includes(repo.id) ? '×' : '+'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="repo-browser-container">
                  <div className="browser-header">
                    <button onClick={handleBackToRepos} className="back-button">
                      Back to Repos
                    </button>
                    <h3>{selectedRepo.name}</h3>
                    {branches.length > 0 && (
                      <select 
                        value={selectedBranch} 
                        onChange={(e) => handleBranchChange(e.target.value)}
                        className="branch-selector"
                      >
                        {branches.map((branch) => (
                          <option key={branch.name} value={branch.name}>
                            {branch.name} {branch.name === defaultBranch && '(default)'}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <div className="repo-browser-split">
                    <div className="repo-browser-left">
                      <div className="breadcrumb">
                        {currentPath || fileContent ? (
                          <button 
                            onClick={() => {
                              setFileContent(null);
                              fetchRepoContents(selectedRepo);
                              navigate(`/dashboard/${selectedRepo.full_name}`);
                            }} 
                            className="breadcrumb-item"
                          >
                            {selectedRepo.name}
                          </button>
                        ) : (
                          <span className="breadcrumb-current">{selectedRepo.name}</span>
                        )}
                        {currentPath && currentPath.split('/').filter(p => p).map((part, index, array) => {
                          const pathUpToHere = array.slice(0, index + 1).join('/');
                          const isLast = index === array.length - 1;
                          // If viewing a file, the last item is the file name and should not be clickable
                          // But when viewing a directory, the last item should also not be clickable (it's current)
                          const shouldBeClickable = fileContent ? true : !isLast;
                          
                          return (
                            <span key={pathUpToHere} className="breadcrumb-segment">
                              <span className="breadcrumb-separator">/</span>
                              {shouldBeClickable ? (
                                <button
                                  onClick={() => {
                                    setFileContent(null);
                                    fetchRepoContents(selectedRepo, pathUpToHere);
                                    navigate(`/dashboard/${selectedRepo.full_name}/${pathUpToHere}`);
                                  }}
                                  className="breadcrumb-item"
                                >
                                  {part}
                                </button>
                              ) : (
                                <span className="breadcrumb-current">{part}</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                      
                      {loadingContents ? (
                        <div className="loading">Loading contents...</div>
                      ) : fileContent ? (
                        <div className="file-viewer">
                          <pre><code>{fileContent}</code></pre>
                        </div>
                      ) : (
                        <div className="contents-list">
                          {[...repoContents]
                            .sort((a, b) => {
                              // Directories first, then files
                              if (a.type === 'dir' && b.type !== 'dir') return -1;
                              if (a.type !== 'dir' && b.type === 'dir') return 1;
                              // Alphabetically within each group
                              return a.name.localeCompare(b.name);
                            })
                            .map((item, idx) => (
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
                    
                    <div className="repo-browser-right">
                      {hasSimanticFile && (
                        <>
                          <h4 className="commit-history-title">Test History</h4>
                          <div className="test-history-section">
                            {testHistory.length === 0 ? (
                              <div className="empty-test-history">
                                <p>No tests run yet. Click "Test" next to a commit to start.</p>
                              </div>
                            ) : (
                              <div className="test-history-list">
                                {testHistory.map((test) => (
                                  <div key={test.id} className={`test-item test-${test.status}`}>
                                    <div className="test-item-header">
                                      <span className={`test-status-badge ${test.status}`}>
                                        {test.status === 'running' ? '⏳' : test.status === 'passed' ? '✓' : '✗'}
                                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                                      </span>
                                      <span className="test-timestamp">{test.timestamp}</span>
                                    </div>
                                    <div className="test-commit-info">
                                      <span className="test-commit-sha">{test.commitSha.substring(0, 7)}</span>
                                      <span className="test-commit-message">{test.commitMessage}</span>
                                    </div>
                                    {test.duration && (
                                      <div className="test-duration">Duration: {test.duration}s</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="section-divider"></div>
                        </>
                      )}
                      
                      <h4 className="commit-history-title">Commit History</h4>
                      {loadingCommits ? (
                        <div className="loading">Loading commits...</div>
                      ) : (
                        <div className="commit-history-list">
                          {commitHistory.map((commit) => (
                            <div key={commit.sha} className="commit-item">
                              <div className="commit-item-content">
                                <div className="commit-item-header">
                                  <a 
                                    href={commit.html_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="commit-sha-link"
                                    title={commit.sha}
                                  >
                                    {commit.sha.substring(0, 7)}
                                  </a>
                                  <span className="commit-item-date">{commit.date}</span>
                                </div>
                                <div className="commit-item-message">{commit.message}</div>
                                <div className="commit-item-author">{commit.author}</div>
                              </div>
                              {hasSimanticFile && (
                                <button className="commit-test-button" disabled>
                                  Test
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
