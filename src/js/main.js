/* ============================================
   THEME TOGGLE
   ============================================ */
const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const toggleLabel = document.getElementById('toggleLabel');
const themeIcon   = document.getElementById('themeIcon');

const SUN_SVG  = `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
const MOON_SVG = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;

function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    toggleLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    themeIcon.innerHTML     = theme === 'dark' ? MOON_SVG : SUN_SVG;
    localStorage.setItem('theme', theme);
}

const saved      = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(saved || (prefersDark ? 'dark' : 'light'));

themeToggle.addEventListener('click', () => {
    applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ============================================
   GITHUB API
   ============================================ */
const GITHUB_USERNAME = 'carlghayes';

async function loadGitHub() {
    try {
        const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=stars&direction=desc&per_page=3`)
        ]);

        const user  = await userRes.json();
        const repos = await reposRes.json();

        document.getElementById('githubStats').innerHTML = `
            <div class="stat"><div class="stat-number">${user.public_repos}</div><div class="stat-label">Repos</div></div>
            <div class="stat"><div class="stat-number">${user.followers}</div><div class="stat-label">Followers</div></div>
            <div class="stat"><div class="stat-number">${user.following}</div><div class="stat-label">Following</div></div>
            <div class="stat"><div class="stat-number">${user.public_gists}</div><div class="stat-label">Gists</div></div>
        `;

        const contribRes = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`);
        const contribData = await contribRes.json();
        const cells = contribData.contributions.slice(-182);

        const grid = document.getElementById('contribGrid');
        grid.innerHTML = '';
        for (const { level } of cells) {
            const cell = document.createElement('div');
            cell.className = `contrib-cell${level > 0 ? ' l' + level : ''}`;
            grid.appendChild(cell);
        }

        const langColors = {
            JavaScript: '#f1e05a', Python: '#3572A5',
            Shell: '#89e051', PowerShell: '#012456',
            HTML: '#e34c26', CSS: '#563d7c',
        };

        document.getElementById('repoList').innerHTML = repos.map(repo => `
            <div class="repo-item">
                <div>
                    <div class="repo-name">
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
                            ${repo.name}
                        </a>
                    </div>
                    <div class="repo-desc">${repo.description || 'No description'}</div>
                </div>
                <div class="repo-meta">
                    ${repo.language ? `
                        <span class="repo-lang-dot"
                              style="background:${langColors[repo.language] || '#888'}">
                        </span>${repo.language}` : ''}
                    ★ ${repo.stargazers_count}
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('GitHub API error:', err);
        document.getElementById('githubStats').innerHTML = `
            <div class="stat" style="grid-column:1/-1;text-align:center">
                <div class="stat-label" style="color:var(--color-text-faint)">Unable to load GitHub data right now.</div>
            </div>`;
        document.getElementById('contribGrid').innerHTML = '';
        document.getElementById('repoList').innerHTML = '';
    }
}

/* ============================================
   CONTACT FORM (Formspree)
   ============================================ */
window.formspree = window.formspree || function () { (formspree.q = formspree.q || []).push(arguments); };
formspree('initForm', { formElement: '#contactForm', formId: 'mwvzdeoa' });

/* ============================================
   NAV ACTIVE STATE
   ============================================ */
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        }
    }
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

document.querySelectorAll('section[id], div[id]').forEach(el => {
    const ids = ['home', 'about', 'contact'];
    if (ids.includes(el.id)) sectionObserver.observe(el);
});

/* ============================================
   MOBILE NAV TOGGLE
   ============================================ */
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    navToggle.classList.toggle('active', open);
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
        navToggle.classList.remove('active');
    });
});

/* ============================================
   INIT
   ============================================ */
loadGitHub();