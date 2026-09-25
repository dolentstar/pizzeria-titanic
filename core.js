/* Motore comune dei layout. Legge window.SITE (data.js) e riempie gli elementi con attributo data-s="...".
   Ogni layout (template/layouts/*.html) decide struttura e stile; qui c'è solo la logica.
   Slot principali: name shortName tagline since city address addressShort addressLead phone email logo
   nav hero-img hero-bg hero-eyebrow hero-title hero-lead hero-cta hero-badges pillars
   story-img story-stamp story-eyebrow story-title story-body story-bullets
   gallery gallery-eyebrow gallery-title gallery-lead
   menu-eyebrow menu-title menu-lead menu-tabs menu-pick menu-search menu-list menu-notes menu-empty
   hours status hours-note contacts contact-actions map social legal footer-contacts callbar year
   Sezioni da nascondere se mancano i dati: data-section="pillars|story|menu|gallery|hours|rating"
   Varianti: data-style sul contenitore menu-list (list|cards|compact|numbered|accordion|boxed). */
(function () {
  const S = window.SITE; if (!S) return;
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const slots = name => $$(`[data-s="${name}"]`);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const setText = (name, v) => slots(name).forEach(e => e.textContent = v ?? '');
  const setHTML = (name, v) => slots(name).forEach(e => e.innerHTML = v ?? '');
  const hideSection = n => $$(`[data-section="${n}"]`).forEach(e => e.hidden = true);
  const tel = S.phoneIntl ? `tel:${S.phoneIntl}` : '';
  const ICON = {
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9"/></svg>',
    facebook: '<svg viewBox="0 0 24 24"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4a22 22 0 0 0-2.5-.1c-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24"><path d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3m0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6m6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0M21.9 8c0-1.6-.4-3-1.6-4.2S17.7 2.1 16 2.1c-1.6-.1-6.5-.1-8.1 0-1.6.1-3 .4-4.2 1.6S2.1 6.3 2.1 8c-.1 1.6-.1 6.5 0 8.1.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.6.1 6.5.1 8.1 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.6.1-6.5.1-8.1M19.8 18a3.1 3.1 0 0 1-1.8 1.8c-1.2.5-4.1.4-5.5.4s-4.2.1-5.4-.4A3.1 3.1 0 0 1 5.3 18c-.5-1.2-.4-4.1-.4-5.4s-.1-4.2.4-5.4A3.1 3.1 0 0 1 7.1 5.4c1.2-.5 4.1-.4 5.4-.4s4.2-.1 5.4.4a3.1 3.1 0 0 1 1.8 1.8c.5 1.2.4 4.1.4 5.4s.1 4.2-.4 5.4"/></svg>',
    tripadvisor: '<svg viewBox="0 0 24 24"><path d="M12 6.2c-2.4 0-4.7.6-6.6 1.8H1.5l1.6 1.8A5 5 0 1 0 9.8 16l2.2 2.4 2.2-2.4a5 5 0 1 0 6.7-6.2l1.6-1.8h-3.8A12.3 12.3 0 0 0 12 6.2M7 9.3a3.7 3.7 0 1 1 0 7.4 3.7 3.7 0 0 1 0-7.4m10 0a3.7 3.7 0 1 1 0 7.4 3.7 3.7 0 0 1 0-7.4"/></svg>'
  };
  window.SITE_ICON = ICON;

  // Tema: i colori di data.js sovrascrivono quelli di default del layout
  const vars = { primary: '--primary', primaryDark: '--primary-2', accent: '--accent', accentLight: '--accent-2', soft: '--soft', cream: '--cream', paper: '--paper', line: '--line', ink: '--ink' };
  const skip = (document.documentElement.dataset.themeKeep || '').split(/\s+/);
  for (const k in vars) if (S.theme?.[k] && !skip.includes(k)) document.documentElement.style.setProperty(vars[k], S.theme[k]);

  document.title = S.seoTitle || `${S.name} · ${S.city}`;
  const md = document.querySelector('meta[name=description]'); if (md) md.content = S.seoDescription || '';

  // Testi semplici
  setText('name', S.name); setText('shortName', S.shortName || S.name); setText('tagline', S.tagline);
  setText('since', S.since ? `dal ${S.since}` : ''); setText('city', S.city);
  setText('address', S.address); setText('addressShort', S.addressShort || S.address); setText('addressLead', S.addressLead || '');
  setText('phone', S.phone || ''); setText('email', S.email || ''); setText('year', new Date().getFullYear());
  slots('logo').forEach(e => { if (S.logo) { e.src = S.logo; e.alt = e.alt || ''; } else e.remove(); });
  slots('tel').forEach(a => { if (tel) a.href = tel; else a.remove(); });
  if (!S.since) $$('[data-if="since"]').forEach(e => e.remove());

  // Navigazione
  const nav = [['#storia', 'Chi siamo', S.story], ['#galleria', 'Foto', S.gallery?.images?.length], ['#menu', S.menu?.navLabel || 'Menù', S.menu], ['#dove', 'Dove siamo', true]];
  slots('nav').forEach(e => {
    e.innerHTML = nav.filter(n => n[2]).map(([h, t]) => `<a href="${h}">${t}</a>`).join('') +
      (tel && e.dataset.call !== 'no' ? `<a class="btn btn-primary nav-call" href="${tel}">${ICON.phone}<span>${esc(S.phone)}</span></a>` : '');
  });

  // Hero
  const H = S.hero || {};
  slots('hero-img').forEach(e => { e.src = H.image; e.alt = H.imageAlt || ''; });
  slots('hero-bg').forEach(e => e.style.backgroundImage = `url("${H.image}")`);
  setText('hero-eyebrow', H.eyebrow || '');
  setHTML('hero-title', esc(H.title) + (H.titleEm ? ` <em>${esc(H.titleEm)}</em>` : ''));
  setText('hero-lead', H.lead || '');
  slots('hero-cta').forEach(e => {
    e.innerHTML = (tel ? `<a class="btn btn-primary" href="${tel}">${ICON.phone}<span>${esc(H.cta || 'Chiama ora')}</span></a>` : '') +
      (S.menu ? `<a class="btn btn-secondary" href="#menu">${esc(H.cta2 || 'Guarda il menù')}</a>` : `<a class="btn btn-secondary" href="#dove">Come arrivare</a>`);
  });
  const badges = [...(H.badges || [])];
  slots('hero-badges').forEach(e => {
    const withRating = e.dataset.rating !== 'no' && S.rating ? [...badges, `★ ${S.rating.value} su ${S.rating.source || 'Google'} · ${S.rating.count} recensioni`] : badges;
    e.innerHTML = withRating.map(b => `<span><i></i>${esc(b)}</span>`).join('');
  });
  if (S.rating) { setText('rating-value', S.rating.value); setText('rating-count', `${S.rating.count} recensioni su ${S.rating.source || 'Google'}`); }
  else hideSection('rating');

  // Pilastri
  if (S.pillars?.length) slots('pillars').forEach(e => {
    e.style.setProperty('--n', S.pillars.length);
    e.innerHTML = S.pillars.map((p, i) => `<div class="p-item"><span class="p-n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p></div>`).join('');
  }); else hideSection('pillars');

  // Storia
  if (S.story) {
    const st = S.story;
    slots('story-img').forEach(e => { e.src = st.image; e.alt = st.imageAlt || ''; });
    slots('story-stamp').forEach(e => { if (st.stamp !== false && S.logo) e.src = S.logo; else e.remove(); });
    setText('story-eyebrow', st.eyebrow || ''); setText('story-title', st.title);
    setHTML('story-body', (st.paragraphs || []).map(p => `<p>${p}</p>`).join(''));
    setHTML('story-bullets', (st.bullets || []).map(b => `<li>${esc(b)}</li>`).join(''));
  } else hideSection('story');

  // Galleria (prima del menù in tutti i layout)
  const G = S.gallery;
  if (G?.images?.length >= 2) {
    setText('gallery-eyebrow', G.eyebrow || 'Galleria'); setText('gallery-title', G.title || ''); setText('gallery-lead', G.lead || '');
    slots('gallery').forEach(e => {
      const max = +(e.dataset.max || 6);
      e.innerHTML = G.images.slice(0, max).map((g, i) => `<figure class="g-item g-${i + 1}"><img src="${g.src}" alt="${esc(g.alt)}" loading="lazy">${e.dataset.captions === 'yes' && g.alt ? `<figcaption>${esc(g.alt)}</figcaption>` : ''}</figure>`).join('');
      e.dataset.count = Math.min(max, G.images.length);
    });
  } else hideSection('gallery');

  // Menù
  const M = S.menu;
  if (M) {
    setText('menu-eyebrow', M.eyebrow || 'Il menù'); setText('menu-title', M.title || 'Il menù'); setText('menu-lead', M.lead || '');
    const cur = M.currency ?? '€ ';
    const price = p => p ? `${cur}${esc(p)}` : '';
    const list = slots('menu-list')[0];
    const style = list?.dataset.style || 'list';
    const item = ([n, p, d, tag], i) => `
      <div class="m-item" data-q="${esc((n + ' ' + (d || '')).toLowerCase())}">
        ${style === 'numbered' ? `<span class="m-num">${String(i + 1).padStart(2, '0')}</span>` : ''}
        <div class="m-row"><span class="m-name">${esc(n)}${tag ? ` <span class="m-tag">${esc(tag)}</span>` : ''}</span><span class="m-dots"></span><span class="m-price">${price(p)}</span></div>
        ${d ? `<p class="m-desc">${esc(d)}</p>` : ''}
      </div>`;
    const cat = c => {
      const inner = `<div class="m-items">${c.items.map(item).join('')}</div>${c.extra ? `<p class="m-extra">${esc(c.extra)}</p>` : ''}`;
      const head = `<h3>${esc(c.t)}</h3>${c.note ? `<small>${esc(c.note)}</small>` : ''}`;
      return style === 'accordion'
        ? `<details class="m-cat" id="cat-${c.id}" data-cat="${c.id}"><summary class="m-cat-h">${head}<span class="m-count">${c.items.length}</span></summary>${inner}</details>`
        : `<section class="m-cat" id="cat-${c.id}" data-cat="${c.id}"><div class="m-cat-h">${head}</div>${inner}</section>`;
    };
    if (list) list.innerHTML = M.categories.map(cat).join('');
    if (style === 'accordion') { const first = list.querySelector('details'); if (first) first.open = true; }
    setHTML('menu-notes', (M.notes || []).map(n => `<span>${esc(n)}</span>`).join('') + (M.pdf ? `<span><a href="${M.pdf}" target="_blank" rel="noopener">Scarica il menù in PDF →</a></span>` : ''));
    slots('menu-notes').forEach(e => { if (!e.innerHTML.trim()) e.hidden = true; });

    const cats = $$('.m-cat');
    const tabs = slots('menu-tabs')[0], pick = slots('menu-pick')[0], search = slots('menu-search')[0];
    if (tabs) tabs.innerHTML = M.categories.map((c, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-go="${c.id}">${esc(c.s || c.t)}</button>`).join('');
    if (pick) pick.innerHTML = M.categories.map(c => `<option value="${c.id}">${esc(c.t)}</option>`).join('');
    if (search) search.innerHTML = `${ICON.search}<input type="search" placeholder="Cerca…" aria-label="Cerca nel menù">`;
    if (M.categories.length < 2) [tabs, pick].forEach(e => e && (e.hidden = true));

    // somma le barre fisse in alto (larghe almeno metà pagina: una colonna laterale non conta)
    const offset = () => $$('[data-sticky]').reduce((a, e) => { const p = getComputedStyle(e).position; return a + ((p === 'sticky' || p === 'fixed') && e.offsetWidth > innerWidth / 2 ? e.offsetHeight : 0); }, 0) + 12;
    const go = id => { const el = document.getElementById('cat-' + id); if (!el) return; if (el.tagName === 'DETAILS') el.open = true; scrollTo({ top: el.getBoundingClientRect().top + scrollY - offset(), behavior: 'smooth' }); };
    tabs?.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.go); });
    pick?.addEventListener('change', () => go(pick.value));
    let current = '';
    const mark = id => { if (id === current) return; current = id; tabs?.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.go === id)); if (pick) pick.value = id; };
    addEventListener('scroll', () => {
      const vis = cats.filter(c => c.style.display !== 'none'); if (!vis.length) return;
      const y = offset() + 30; let id = vis[0].dataset.cat;
      for (const c of vis) if (c.getBoundingClientRect().top < y) id = c.dataset.cat;
      mark(id);
    }, { passive: true });
    search?.querySelector('input').addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase(); let any = false;
      cats.forEach(c => {
        let v = 0; c.querySelectorAll('.m-item').forEach(it => { const ok = !q || it.dataset.q.includes(q); it.style.display = ok ? '' : 'none'; v += ok; });
        c.style.display = v ? '' : 'none'; if (q && v && c.tagName === 'DETAILS') c.open = true; any ||= v > 0;
      });
      slots('menu-empty').forEach(el => el.hidden = any);
    });
  } else hideSection('menu');
  slots('menu-empty').forEach(el => el.hidden = true);

  // Dove siamo e contatti
  const q = encodeURIComponent(S.mapsQuery || `${S.name}, ${S.address}`);
  slots('map').forEach(e => { e.src = `https://maps.google.com/maps?q=${q}&z=16&output=embed`; e.title = `Mappa ${S.name}`; e.loading = 'lazy'; });
  const dir = `https://www.google.com/maps/search/?api=1&query=${q}`;
  slots('directions').forEach(a => { a.href = dir; a.target = '_blank'; a.rel = 'noopener'; });
  const wa = S.whatsapp ? `https://wa.me/${S.whatsapp.replace(/\D/g, '').replace(/^(?!39)/, '39')}` : '';
  setHTML('contacts', [esc(S.address), S.phone && `Tel. <a href="${tel}">${esc(S.phone)}</a>`, S.whatsapp && `WhatsApp ${esc(S.whatsapp)}`, S.email && `<a href="mailto:${S.email}">${esc(S.email)}</a>`].filter(Boolean).join('<br>'));
  setHTML('contact-actions', [tel && `<a class="btn btn-primary" href="${tel}">Chiama</a>`, `<a class="btn btn-secondary" href="${dir}" target="_blank" rel="noopener">Indicazioni</a>`, wa && `<a class="btn btn-secondary" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>`, S.email && `<a class="btn btn-secondary" href="mailto:${S.email}">Email</a>`].filter(Boolean).join(''));
  setHTML('footer-contacts', `<strong>${esc(S.name)}</strong><br>${esc(S.address)}<br>` + [S.phone && `<a href="${tel}">${esc(S.phone)}</a>`, S.email && `<a href="mailto:${S.email}">${esc(S.email)}</a>`].filter(Boolean).join(' · '));
  setHTML('social', Object.entries(S.social || {}).filter(([k, v]) => v && ICON[k]).map(([k, v]) => `<a href="${v}" target="_blank" rel="noopener" aria-label="${k}">${ICON[k]}</a>`).join(''));
  setText('legal', [S.footerLine, `© ${S.name}`, S.piva ? `P.IVA ${S.piva}` : ''].filter(Boolean).join(' · '));
  setHTML('callbar', (tel ? `<a class="btn btn-primary" href="${tel}">${ICON.phone}<span>Chiama</span></a>` : '') + `<a class="btn btn-secondary" href="${M ? '#menu' : '#dove'}">${M ? 'Menù' : 'Dove siamo'}</a>`);

  // Orari: lunedì → domenica, [[hA,mA,hB,mB], ...]
  if (S.hours?.length === 7) {
    const now = new Date(), dow = (now.getDay() + 6) % 7, mins = now.getHours() * 60 + now.getMinutes();
    const f = (h, m) => String(h === 24 ? 0 : h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    setHTML('hours', S.hours.map(([d, sl], i) => `<tr class="${i === dow ? 'today' : ''} ${sl.length ? '' : 'closed'}"><td>${d}</td><td>${sl.length ? sl.map(s => f(s[0], s[1]) + '–' + f(s[2], s[3])).join(' · ') : 'Chiuso'}</td></tr>`).join(''));
    const open = S.hours[dow][1].some(([a, b, c, d]) => mins >= a * 60 + b && mins < c * 60 + d);
    slots('status').forEach(e => { e.classList.add(open ? 'is-open' : 'is-closed'); e.innerHTML = `<i></i>${open ? 'Aperto ora' : 'Chiuso ora'}`; });
    setText('hours-note', S.hoursNote || '');
  } else { hideSection('hours'); slots('status').forEach(e => e.remove()); }

  // Header che diventa pieno allo scroll + comparsa animata
  const hd = document.querySelector('[data-solid]');
  if (hd) { const on = () => hd.classList.toggle('solid', scrollY > 40); on(); addEventListener('scroll', on, { passive: true }); }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 }) : null;
  // ciò che è già visibile al caricamento compare subito (la hero non deve mai restare trasparente)
  $$('.reveal').forEach(el => (!io || el.getBoundingClientRect().top < innerHeight) ? el.classList.add('in') : io.observe(el));
})();
