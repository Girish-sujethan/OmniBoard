import React, { useState, useEffect } from 'react';
import { FolderOpen, ExternalLink, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ProjectBrowser = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.listProjects();
      if (response.success) {
        setProjects(response.projects || []);
      } else {
        setError(response.error || 'Failed to load projects');
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenProject = async (projectPath) => {
    try {
      await api.openProject(projectPath);
      alert('Opening project in KiCad...');
    } catch (err) {
      console.error('Failed to open project:', err);
      alert('Failed to open project: ' + err.message);
    }
  };

  const handleViewDetails = async (project) => {
    setSelectedProject(project);
    
    try {
      const response = await api.getProjectDetails(project.path);
      if (response.success) {
        setSelectedProject({ ...project, details: response.project });
      }
    } catch (err) {
      console.error('Failed to get project details:', err);
      alert('Failed to load project details');
    }
  };

  return (
    <div className="min-h-screen bg-[#140a24] text-purple-100">
      <header className="bg-[#1b0f2f] border-b border-purple-500/20 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-purple-50">KiCad Projects</h1>
            <p className="text-sm text-purple-300">Browse and manage your KiCad projects</p>
          </div>
          <button
            onClick={loadProjects}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-purple-900 disabled:cursor-not-allowed text-white rounded-none transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500/30 rounded-none p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Error loading projects</p>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          {isLoading && projects.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-300" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 text-purple-300">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="text-xl font-semibold text-purple-100 mb-2">No projects found</h2>
              <p className="text-sm">
                Make sure your KiCad projects are in the configured search paths.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="bg-[#1b0f2f] border border-purple-500/20 hover:border-purple-500/40 transition-colors rounded-none p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-100 truncate">
                        {project.name || `Project ${index + 1}`}
                      </h3>
                      <p className="text-xs text-purple-400 mt-1 truncate">
                        {project.path}
                      </p>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-purple-300 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="text-xs text-purple-400 mb-4 space-y-1">
                    {project.modified && (
                      <p>Modified: {new Date(project.modified).toLocaleDateString()}</p>
                    )}
                    {project.file_count && (
                      <p>Files: {project.file_count}</p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(project)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded-none transition-colors"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => handleOpenProject(project.path)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-900 hover:bg-purple-800 text-white text-sm rounded-none transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedProject && selectedProject.details && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1b0f2f] border border-purple-500/30 rounded-none max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-purple-100">
                    {selectedProject.details.name || selectedProject.name}
                  </h2>
                  <p className="text-sm text-purple-400 mt-1">
                    {selectedProject.details.path || selectedProject.path}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-purple-300 hover:text-purple-100"
                >
                  ×
                </button>
              </div>

              {selectedProject.details.files && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-purple-200 uppercase tracking-[0.2em] mb-2">
                    Project Files
                  </h3>
                  <div className="bg-[#140a24] border border-purple-500/20 rounded-none p-3">
                    {Object.entries(selectedProject.details.files).map(([type, path]) => (
                      <p key={type} className="text-sm text-purple-300 py-1">
                        <span className="text-purple-200">{type}:</span> {path}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.details.metadata && Object.keys(selectedProject.details.metadata).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-purple-200 uppercase tracking-[0.2em] mb-2">
                    Metadata
                  </h3>
                  <div className="bg-[#140a24] border border-purple-500/20 rounded-none p-3">
                    {Object.entries(selectedProject.details.metadata).map(([key, value]) => (
                      <p key={key} className="text-sm text-purple-300 py-1">
                        <span className="text-purple-200">{key}:</span> {String(value)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBrowser;
