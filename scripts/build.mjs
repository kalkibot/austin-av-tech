import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const root = process.cwd();
const contentDir = path.join(root, 'content');
const distDir = path.join(root, 'dist');
const site = {
  name: 'Austin AV Tech',
  url: 'https://austin-av-tech.vercel.app',
  description: 'Source-backed Austin commercial AV planning and implementation guidance for Austin businesses.'
};

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function readMd(file) { return matter(fs.readFileSync(file, 'utf8')); }
function writeFile(rel, text) {
  const out = path.join(distDir, rel);
  ensureDir(path.dirname(out));
  fs.writeFileSync(out, text);
}
function escapeHtml(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function stripMarkdown(md = '') {
  return String(md)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_~>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function absoluteUrl(pathname = '/') { return `${site.url}${pathname.startsWith('/') ? pathname : `/${pathname}`}`; }
function formatDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value || '');
  return d.toISOString().slice(0, 10);
}

function pageTemplate({ title, description, pathname, body, jsonLd = [] }) {
  const canonical = absoluteUrl(pathname);
  const seoTitle = escapeHtml(title || site.name);
  const seoDesc = escapeHtml(description || site.description);
  const ld = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean)
    .map(obj => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDesc}"/>
  <link rel="canonical" href="${canonical}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="${escapeHtml(site.name)}"/>
  <meta property="og:title" content="${seoTitle}"/>
  <meta property="og:description" content="${seoDesc}"/>
  <meta property="og:url" content="${canonical}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${seoTitle}"/>
  <meta name="twitter:description" content="${seoDesc}"/>
  ${ld}
  <style>

    :root{--bg:#f4f7fb;--surface:#ffffff;--surface-2:#f8fafc;--text:#0f172a;--muted:#475569;--brand:#2563eb;--accent:#7c3aed;--ok:#0ea5a5;--border:#e2e8f0}
    *{box-sizing:border-box}
    body{margin:0;background:linear-gradient(180deg,#f8fbff 0%,#f4f7fb 100%);color:var(--text);font-family:Inter,system-ui,Arial,sans-serif;line-height:1.65}
    .wrap{max-width:1080px;margin:0 auto;padding:24px}
    header{display:flex;justify-content:space-between;align-items:center;padding:12px 0 18px;border-bottom:1px solid var(--border);background:rgba(255,255,255,.75);backdrop-filter:blur(6px);position:sticky;top:0;z-index:10}
    nav a{margin-left:14px;font-weight:600;font-size:.95rem;color:var(--muted)} nav a:hover{color:var(--brand)}
    a{color:var(--brand);text-decoration:none}
    .hero{background:linear-gradient(135deg,#ffffff 0%,#eef4ff 60%,#f3efff 100%);border:1px solid var(--border);padding:22px;border-radius:16px;margin:18px 0;box-shadow:0 10px 22px rgba(15,23,42,.06)}
    .cta{background:linear-gradient(135deg,#eef4ff 0%,#f3efff 100%)}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
    .card{border:1px solid var(--border);border-radius:14px;padding:16px;background:var(--surface);box-shadow:0 6px 14px rgba(15,23,42,.05)}
    .card h3{margin-top:0}
    .muted{color:var(--muted)}
    h1,h2,h3{line-height:1.24} h1{font-size:2rem;letter-spacing:-.01em} h2{margin-top:1.4rem}
    ul,ol{padding-left:1.2rem} .article-meta{margin-top:-8px;margin-bottom:14px}
    .breadcrumbs{font-size:.9rem;color:var(--muted);margin:10px 0}
    .related{margin-top:24px}
    .pill{display:inline-block;padding:5px 11px;border-radius:999px;background:#e9e7ff;color:#4c1d95;font-size:.78rem;font-weight:700;margin-bottom:8px;border:1px solid #d8d4fe}
    .btn{display:inline-block;padding:10px 14px;border-radius:10px;background:var(--brand);color:#fff !important;font-weight:700;margin-right:10px}
    .btn.alt{background:var(--accent)}
    .kpis{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
    .kpi{padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2);color:#334155;font-size:.85rem}
    .fade{animation:fadeUp .4s ease both}
    @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none !important;transition:none !important}}
    footer{border-top:1px solid var(--border);margin-top:24px;padding-top:14px;color:var(--muted);font-size:.95rem}

  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <a href="/"><strong>${escapeHtml(site.name)}</strong></a>
      <nav>
        <a href="/posts/">Posts</a>
        <a href="/tv-mounting-austin/">TV Mounting</a>
        <a href="/security-camera-installation-austin/">Cameras</a>
        <a href="/av-buyers-checklist/">Checklist</a>
        <a href="/book-installation/">Book</a>
      </nav>
    </header>
    ${body}
    <footer>Source-backed Austin AV content. Public references only.</footer>
  </div>
</body>
</html>`;
}

function extractFaq(markdown = '') {
  const lines = markdown.split('\n');
  const i = lines.findIndex(l => /^##\s+FAQ\b/i.test(l.trim()));
  if (i === -1) return [];
  const out = [];
  let q = null, a = [];
  for (let x = i + 1; x < lines.length; x++) {
    const line = lines[x];
    if (/^##\s+/.test(line)) break;
    const m = /^###\s+(.+)/.exec(line.trim());
    if (m) {
      if (q && a.join(' ').trim()) out.push({ q, a: a.join(' ').trim() });
      q = m[1].trim();
      a = [];
    } else if (q) {
      a.push(line.trim());
    }
  }
  if (q && a.join(' ').trim()) out.push({ q, a: a.join(' ').trim() });
  return out;
}

fs.rmSync(distDir, { recursive: true, force: true });
ensureDir(distDir);

const pagesDir = path.join(contentDir, 'pages');
const postsDir = path.join(contentDir, 'posts');
const pages = fs.existsSync(pagesDir) ? fs.readdirSync(pagesDir).filter(f => f.endsWith('.md')) : [];
const postFiles = fs.existsSync(postsDir) ? fs.readdirSync(postsDir).filter(f => f.endsWith('.md')) : [];

const builtPosts = [];
const postBodies = new Map();

for (const f of postFiles) {
  const { data, content } = readMd(path.join(postsDir, f));
  const slug = data.slug || f.replace(/\.md$/, '');
  const title = data.title || slug;
  const date = data.date || '';
  const status = data.status || 'draft';
  const metaDescription = data.meta_description || stripMarkdown(content).slice(0, 155);
  builtPosts.push({ slug, title, date, status, metaDescription, content });
  postBodies.set(slug, { data, content });
}

builtPosts.sort((a, b) => String(b.date).localeCompare(String(a.date)));

for (const f of pages) {
  const { data, content } = readMd(path.join(pagesDir, f));
  const slug = data.slug || '/';
  const pathname = slug === '/' ? '/' : `/${slug.replace(/^\//, '').replace(/\/$/, '')}/`;
  const title = data.title || site.name;
  const description = data.meta_description || stripMarkdown(content).slice(0, 155) || site.description;
  const rel = pathname === '/' ? 'index.html' : `${pathname.replace(/^\//, '')}index.html`;

  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: absoluteUrl(pathname)
  };

  writeFile(rel, pageTemplate({ title, description, pathname, body: marked.parse(content), jsonLd: [pageLd] }));
}

for (const p of builtPosts) {
  const { slug, title, date, status, metaDescription, content } = p;
  const dateText = formatDate(date);
  const pathname = `/posts/${slug}/`;
  const related = builtPosts.filter(x => x.slug !== slug).slice(0, 2);
  const relatedHtml = related.length ? `<section class="related"><h2>Related</h2><div class="grid">${related.map(r => `<article class="card fade"><h3><a href="/posts/${r.slug}/">${escapeHtml(r.title)}</a></h3><p class="muted">${escapeHtml(formatDate(r.date))}</p></article>`).join('')}</div></section>` : '';
  const ctaHtml = `<section class="hero cta"><h2>Get weekly Austin AV buyer brief</h2><p>Scope smarter, buy faster, and avoid costly AV deployment mistakes.</p><p><a class="btn" href="/book-installation/">Book Installation</a><a class="btn alt" href="/av-buyers-checklist/">Open Buyer Checklist</a> <a href="/sponsor/">Sponsor</a></p></section>`;

  const breadcrumbs = `<nav class="breadcrumbs"><a href="/">Home</a> › <a href="/posts/">Posts</a> › ${escapeHtml(title)}</nav>`;
  const body = `<article>${breadcrumbs}<h1>${escapeHtml(title)}</h1><p class="muted article-meta">${escapeHtml(dateText)} · ${escapeHtml(String(status))}</p>${marked.parse(content)}</article>${ctaHtml}${relatedHtml}`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    datePublished: dateText,
    dateModified: dateText,
    author: { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name },
    mainEntityOfPage: absoluteUrl(pathname),
    description: metaDescription
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Posts', item: absoluteUrl('/posts/') },
      { '@type': 'ListItem', position: 3, name: title, item: absoluteUrl(pathname) }
    ]
  };
  const faqs = extractFaq(content);
  const faqLd = faqs.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } }))
  } : null;

  writeFile(`posts/${slug}/index.html`, pageTemplate({ title, description: metaDescription, pathname, body, jsonLd: [articleLd, breadcrumbLd, faqLd] }));
}

const published = builtPosts.filter(p => p.status !== 'draft');
const listSource = published.length ? published : builtPosts;
const cards = listSource.map(p => `<article class="card fade"><h3><a href="/posts/${p.slug}/">${escapeHtml(p.title)}</a></h3><p class="muted">${escapeHtml(formatDate(p.date))} · ${escapeHtml(String(p.status))}</p><p>${escapeHtml((p.metaDescription || '').slice(0, 150))}</p></article>`).join('');
writeFile('posts/index.html', pageTemplate({
  title: 'Posts',
  description: 'Austin AV Tech article archive and updates.',
  pathname: '/posts/',
  body: `<h1>Posts</h1><p class="muted">Austin AV planning + operations updates.</p><section class="grid">${cards}</section>`,
  jsonLd: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Posts', url: absoluteUrl('/posts/') }]
}));

const homePath = path.join(distDir, 'index.html');
if (fs.existsSync(homePath)) {
  const home = fs.readFileSync(homePath, 'utf8');
  const latest = listSource.slice(0, 3).map(p => `<article class="card fade"><h3><a href="/posts/${p.slug}/">${escapeHtml(p.title)}</a></h3><p class="muted">${escapeHtml(formatDate(p.date))}</p></article>`).join('');
  const block = `<section class="hero"><span class="pill">Austin AV Tech 2026</span><h2>Residential AV installation guidance for Austin homeowners.</h2><p>Source-backed buying playbooks, deployment checklists, and vendor selection frameworks.</p><div class="kpis"><span class="kpi">Local-intent SEO</span><span class="kpi">Buyer checklists</span><span class="kpi">Weekly brief</span></div><p><a class="btn" href="/weekly-brief/">Book Installation</a><a class="btn alt" href="/av-buyers-checklist/">Open Buyer Checklist</a> <a href="/posts/">Explore Articles</a></p><div class="grid"><div class="card"><h3><a href="/posts/">Latest Posts</a></h3><p>Actionable AV buying and deployment content updated weekly.</p></div><div class="card"><h3><a href="/editorial-policy/">Editorial Policy</a></h3><p>How sources and recommendations are validated.</p></div><div class="card"><h3><a href="/sponsor/">Sponsor</a></h3><p>Get practical setup guidance for Austin homes.</p></div></div></section><section><h2>Recent Articles</h2><div class="grid">${latest}</div></section>`;
  fs.writeFileSync(homePath, home.replace('</header>', '</header>' + block));
}

const sitemapUrls = ['/', '/posts/', '/editorial-policy/', ...builtPosts.map(p => `/posts/${p.slug}/`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map(u => `  <url><loc>${absoluteUrl(u)}</loc></url>`).join('\n')}\n</urlset>\n`;
writeFile('sitemap.xml', sitemap);
writeFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`);
writeFile('site.webmanifest', JSON.stringify({ name: site.name, short_name: 'AAVT', start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#0b57d0' }, null, 2));

console.log(`Built ${builtPosts.length} posts.`);
