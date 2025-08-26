const searchInput = document.getElementById('search');
const clearBtn = document.getElementById('clear');
const chips = document.querySelectorAll('.chip');
const grid = document.getElementById('grid');
const emptyState = document.getElementById('empty');
const loading = document.getElementById('loading');
const stats = document.getElementById('stats');
const timing = document.getElementById('timing');
const resetBtn = document.getElementById('reset');

let debounceTimer = null;
let currentFilter = 'all';
let searchTerm = '';

const items = [
  { id: 1, title: 'Figma Design System', category: 'tools', desc: 'Complete UI kit with components, tokens, and guidelines for consistent design.', author: 'Design Team', date: '2025-01-15' },
  { id: 2, title: 'React Performance Guide', category: 'articles', desc: 'Deep dive into optimization techniques, memoization, and rendering best practices.', author: 'Alex Chen', date: '2025-01-12' },
  { id: 3, title: 'CSS Grid Tutorial', category: 'tutorials', desc: 'Master modern layouts with grid properties, areas, and responsive patterns.', author: 'Sarah Kim', date: '2025-01-10' },
  { id: 4, title: 'VS Code Extensions Pack', category: 'resources', desc: 'Curated collection of productivity boosters for web development workflows.', author: 'Dev Tools', date: '2025-01-08' },
  { id: 5, title: 'Tailwind CSS Cheatsheet', category: 'resources', desc: 'Quick reference for utility classes, responsive variants, and custom configs.', author: 'UI Library', date: '2025-01-05' },
  { id: 6, title: 'JavaScript Testing Strategy', category: 'articles', desc: 'Unit, integration, and E2E testing approaches for maintainable codebases.', author: 'QA Team', date: '2025-01-03' },
  { id: 7, title: 'Node.js API Tutorial', category: 'tutorials', desc: 'Build RESTful services with Express, middleware, authentication, and deployment.', author: 'Backend Guild', date: '2025-01-01' },
  { id: 8, title: 'Sketch to Code Workflow', category: 'tools', desc: 'Bridge design and development with automated component generation tools.', author: 'Workflow Team', date: '2024-12-28' },
  { id: 9, title: 'TypeScript Migration Guide', category: 'articles', desc: 'Step-by-step approach to adding types to existing JavaScript projects.', author: 'TS Experts', date: '2024-12-25' },
  { id: 10, title: 'Animation with Framer Motion', category: 'tutorials', desc: 'Create smooth, declarative animations for React applications and prototypes.', author: 'Motion Lab', date: '2024-12-22' },
  { id: 11, title: 'Docker for Frontend Devs', category: 'tools', desc: 'Containerize development environments and streamline deployment pipelines.', author: 'DevOps Team', date: '2024-12-20' },
  { id: 12, title: 'Accessibility Audit Checklist', category: 'resources', desc: 'Comprehensive WCAG guidelines and testing tools for inclusive web experiences.', author: 'A11y Guild', date: '2024-12-18' },
  { id: 13, title: 'GraphQL Best Practices', category: 'articles', desc: 'Schema design, query optimization, and client-side caching strategies.', author: 'API Team', date: '2024-12-15' },
  { id: 14, title: 'Webpack to Vite Migration', category: 'tutorials', desc: 'Modernize build tooling for faster development and optimized production builds.', author: 'Build Tools', date: '2024-12-12' },
  { id: 15, title: 'Design Tokens Generator', category: 'tools', desc: 'Export colors, typography, and spacing from design files to code formats.', author: 'Design Systems', date: '2024-12-10' },
  { id: 16, title: 'Code Review Guidelines', category: 'resources', desc: 'Team standards for constructive feedback, security, and knowledge sharing.', author: 'Engineering', date: '2024-12-08' },
  { id: 17, title: 'PWA Implementation Guide', category: 'articles', desc: 'Service workers, offline strategies, and native app-like experiences.', author: 'Mobile Team', date: '2024-12-05' },
  { id: 18, title: 'Vue 3 Composition API', category: 'tutorials', desc: 'Leverage reactivity, lifecycle hooks, and reusable logic patterns.', author: 'Vue Masters', date: '2024-12-03' },
  { id: 19, title: 'Chrome DevTools Mastery', category: 'tools', desc: 'Advanced debugging, performance profiling, and network analysis techniques.', author: 'Debug Squad', date: '2024-12-01' },
  { id: 20, title: 'Micro-Frontend Architecture', category: 'articles', desc: 'Scale large applications with independent, deployable frontend modules.', author: 'Architecture', date: '2024-11-28' },
  { id: 21, title: 'SASS Advanced Techniques', category: 'tutorials', desc: 'Mixins, functions, and modular CSS architecture for maintainable styles.', author: 'CSS Wizards', date: '2024-11-25' },
  { id: 22, title: 'Git Workflow Optimizer', category: 'tools', desc: 'Branching strategies, commit conventions, and automated quality gates.', author: 'Git Ninjas', date: '2024-11-22' },
  { id: 23, title: 'Security Headers Guide', category: 'resources', desc: 'Essential HTTP headers for protecting web applications from common attacks.', author: 'Security Team', date: '2024-11-20' },
  { id: 24, title: 'Component Library Setup', category: 'tutorials', desc: 'Build, document, and distribute reusable UI components across projects.', author: 'Component Team', date: '2024-11-18' }
];

function highlightText(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

function createItemHTML(item) {
  const highlightedTitle = highlightText(item.title, searchTerm);
  const highlightedDesc = highlightText(item.desc, searchTerm);
  return `
    <article class="item" data-category="${item.category}">
      <div class="item-header">
        <h3 class="item-title">${highlightedTitle}</h3>
        <span class="item-category">${item.category}</span>
      </div>
      <p class="item-desc">${highlightedDesc}</p>
      <div class="item-meta">
        <span class="item-author">by ${item.author}</span>
        <time class="item-date">${item.date}</time>
      </div>
    </article>
  `;
}

function filterItems() {
  const start = performance.now();
  
  let filtered = items;
  
  if (currentFilter !== 'all') {
    filtered = filtered.filter(item => item.category === currentFilter);
  }
  
  if (searchTerm) {
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  const end = performance.now();
  timing.textContent = `${(end - start).toFixed(1)}ms`;
  
  renderItems(filtered);
  updateStats(filtered.length);
}

function renderItems(filteredItems) {
  if (filteredItems.length === 0) {
    grid.style.display = 'none';
    emptyState.hidden = false;
  } else {
    grid.style.display = 'grid';
    emptyState.hidden = true;
    grid.innerHTML = filteredItems.map(createItemHTML).join('');
  }
}

function updateStats(count) {
  const countEl = stats.querySelector('.count');
  countEl.textContent = `${count} item${count !== 1 ? 's' : ''}`;
}

function debounce(func, delay) {
  return function(...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

const debouncedFilter = debounce(filterItems, 150);

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value.trim();
  clearBtn.hidden = !searchTerm;
  debouncedFilter();
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchTerm = '';
  clearBtn.hidden = true;
  searchInput.focus();
  filterItems();
});

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    filterItems();
  });
});

resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchTerm = '';
  currentFilter = 'all';
  clearBtn.hidden = true;
  chips.forEach(c => c.classList.remove('active'));
  chips[0].classList.add('active');
  filterItems();
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchInput.blur();
    if (searchTerm) {
      clearBtn.click();
    }
  }
});

// Initialize
filterItems();
