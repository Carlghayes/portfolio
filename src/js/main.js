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
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=3`)
        ]);

        const user  = await userRes.json();
        const repos = await reposRes.json();

        document.getElementById('githubStats').innerHTML = `
            <div class="stat"><div class="stat-number">${user.public_repos}</div><div class="stat-label">Repos</div></div>
            <div class="stat"><div class="stat-number">${user.followers}</div><div class="stat-label">Followers</div></div>
            <div class="stat"><div class="stat-number">${user.following}</div><div class="stat-label">Following</div></div>
            <div class="stat"><div class="stat-number">${user.public_gists}</div><div class="stat-label">Gists</div></div>
        `;

        const grid = document.getElementById('contribGrid');
        grid.innerHTML = '';
        for (let i = 0; i < 182; i++) {
            const level = Math.random() < 0.55 ? 0 : Math.floor(Math.random() * 4) + 1;
            const cell  = document.createElement('div');
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
    }
}

/* ============================================
   HASHNODE API
   ============================================ */
const HASHNODE_USERNAME = 'yourusername'; // <-- replace

async function loadWriting() {
    const query = `
        query {
            user(username: "${HASHNODE_USERNAME}") {
                posts(page: 1, pageSize: 3) {
                    nodes {
                        title
                        brief
                        slug
                        publishedAt
                        tags { name }
                    }
                }
            }
        }
    `;

    try {
        const res  = await fetch('https://gql.hashnode.com', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ query })
        });

        const data  = await res.json();
        const posts = data?.data?.user?.posts?.nodes;

        if (!posts || posts.length === 0) {
            document.getElementById('writingGrid').innerHTML = `
                <div class="writing-card">
                    <div class="writing-title" style="color:var(--color-text-faint)">
                        No articles yet — check back soon.
                    </div>
                </div>`;
            return;
        }

        document.getElementById('writingGrid').innerHTML = posts.map((post, i) => {
            const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short', year: 'numeric'
            });
            const tag = post.tags?.[0]?.name || 'Article';
            const url = `https://${HASHNODE_USERNAME}.hashnode.dev/${post.slug}`;

            return `
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="writing-card">
                    <div class="writing-ghost-num">0${i + 1}</div>
                    <div class="writing-cat">${tag}</div>
                    <div class="writing-title">${post.title}</div>
                    <div class="writing-excerpt">${post.brief}</div>
                    <div class="writing-footer">
                        <span class="writing-date">${date}</span>
                        <span class="writing-read">Read →</span>
                    </div>
                </a>`;
        }).join('');

    } catch (err) {
        console.error('Hashnode API error:', err);
    }
}

/* ============================================
   CONTACT FORM
   ============================================ */
const contactForm = document.getElementById('contactForm');
const formBtn     = contactForm.querySelector('.btn');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Basic honeypot check — handled server side by Formspree
    // but we validate fields client side first
    if (!name || !email || !message) return;

    formBtn.textContent    = 'Sending...';
    formBtn.disabled       = true;
    formBtn.style.opacity  = '0.6';

    try {
        const res = await fetch('https://formspree.io/f/mwvzdeoa', {
            method:  'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept':       'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        const data = await res.json();

        if (res.ok) {
            formBtn.textContent   = 'Message sent ✓';
            formBtn.style.opacity = '1';
            contactForm.reset();
            setTimeout(() => {
                formBtn.textContent = 'Send message';
                formBtn.disabled    = false;
            }, 3000);
        } else {
            throw new Error(data?.errors?.[0]?.message || 'Submission failed');
        }

    } catch (err) {
        console.error('Form error:', err);
        formBtn.textContent   = 'Something went wrong';
        formBtn.style.opacity = '1';
        setTimeout(() => {
            formBtn.textContent = 'Send message';
            formBtn.disabled    = false;
        }, 3000);
    }
});

/* ============================================
   INIT
   ============================================ */
loadGitHub();
loadWriting();