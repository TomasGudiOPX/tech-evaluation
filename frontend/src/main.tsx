import { FormEvent, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Project = {
  id: number;
  name: string;
  created_at: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [service, setService] = useState('Checking API...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProjects() {
    setIsLoading(true);
    setError('');

    try {
      const [configResponse, projectsResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/config`),
        fetch(`${apiBaseUrl}/projects`),
      ]);

      if (!configResponse.ok || !projectsResponse.ok) {
        throw new Error('The API did not return a successful response.');
      }

      const config = await configResponse.json();
      const data = await projectsResponse.json();
      setService(`${config.service} (${config.environment})`);
      setProjects(data.projects);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to reach the API.');
      setService('API unavailable');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) return;

    setError('');
    try {
      const response = await fetch(`${apiBaseUrl}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) throw new Error('The project could not be created.');

      const data = await response.json();
      setProjects((current) => [data.project, ...current]);
      setName('');
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create the project.');
    }
  }

  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow">VPS starter</p>
          <h1>Project workspace</h1>
        </div>
        <span className={error ? 'status status-error' : 'status'}>{service}</span>
      </header>

      <section className="workspace" aria-label="Projects">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Database-backed example</p>
            <h2>Projects</h2>
          </div>
          <span className="count">{projects.length}</span>
        </div>

        <form className="project-form" onSubmit={createProject}>
          <label htmlFor="project-name">New project</label>
          <div className="form-row">
            <input id="project-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Client onboarding" maxLength={120} />
            <button type="submit">Add project</button>
          </div>
        </form>

        {error && <p className="message error-message">{error}</p>}
        <div className="project-list">
          {isLoading && <p className="message">Loading projects...</p>}
          {!isLoading && projects.length === 0 && <p className="message">No projects yet. Add one to verify the full stack.</p>}
          {projects.map((project) => (
            <article className="project" key={project.id}>
              <strong>{project.name}</strong>
              <time dateTime={project.created_at}>{new Date(project.created_at).toLocaleString()}</time>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
