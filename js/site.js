// EP Masters Hockey public site. Static page; the live teams, fixtures and notices
// come from the members portal's public endpoint (/api/public), which only returns
// records the committee marked public. Ported from the portal's own home page
// (app/home.tsx, team-groups.ts, calendar.ts, notices.ts) so both read the same way.
(() => {
  const members = document.querySelector('meta[name="epm-members"]').content.replace(/\/$/, '');
  const $ = id => document.getElementById(id);

  // Every "member area" link goes to the portal.
  for (const a of document.querySelectorAll('a[data-members]')) a.href = members + '/portal';

  // Mobile menu.
  const nav = $('nav'), toggle = $('menu-toggle');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelector('.icon-open').hidden = open;
    toggle.querySelector('.icon-close').hidden = !open;
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  for (const a of nav.querySelectorAll('a')) a.addEventListener('click', () => setMenu(false));

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const icon = name => $('icon-' + name).content.firstElementChild.cloneNode(true);
  const day = d => new Date(d + 'T12:00:00');

  function groupTeams(teams) {
    const groups = [
      { id: 'men', label: 'Men’s teams', category: 'men', teams: [] },
      { id: 'ladies', label: 'Ladies’ teams', category: 'ladies', teams: [] },
    ];
    const other = [];
    for (const t of teams) {
      const g = groups.find(g => g.category === (t.data.category || '').trim().toLowerCase());
      (g ? g.teams : other).push(t);
    }
    if (other.length) groups.push({ id: 'other', label: 'Other teams', teams: other });
    const age = t => { const n = parseInt(t.data.ageGroup || '', 10); return Number.isNaN(n) ? Infinity : n; };
    for (const g of groups) g.teams.sort((a, b) => age(a) !== age(b) ? (age(a) < age(b) ? -1 : 1)
      : (a.data.name || '').localeCompare(b.data.name || '', 'en', { numeric: true, sensitivity: 'base' }));
    return groups.filter(g => g.teams.length);
  }

  function calendarEntries(records) {
    return records.filter(r => r.kind === 'fixture' || r.kind === 'tournament').map(r => r.kind !== 'tournament' ? r : {
      ...r, data: { ...r.data, title: r.data.name, type: 'Tournament', date: r.data.startDate, time: '', venue: r.data.location },
    }).sort((a, b) => {
      const t = r => `${r.data.date || ''}T${r.data.time || '00:00'}`;
      return t(a).localeCompare(t(b)) || String(a.data.title || '').localeCompare(String(b.data.title || ''));
    });
  }
  const endDate = r => r.kind === 'tournament' ? r.data.endDate || r.data.date : r.data.date;

  const noticeOrder = list => [...list].sort((a, b) =>
    Number(b.data.pinned === true) - Number(a.data.pinned === true)
    || (a.data.pinned === true ? (Number(b.data.pinnedAt) || 0) - (Number(a.data.pinnedAt) || 0) : 0)
    || (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0) || a.id.localeCompare(b.id));

  function renderTeams(teams) {
    if (!teams.length) return;
    const dir = el('div', 'public-team-directory');
    for (const g of groupTeams(teams)) {
      const sec = el('section', 'public-team-category');
      const h = el('h3', null, g.label); h.id = 'public-teams-' + g.id;
      sec.setAttribute('aria-labelledby', h.id);
      const list = el('div', 'public-team-list');
      for (const t of g.teams) {
        const card = el('a', 'public-team-card'); card.href = members + '/portal';
        card.append(el('span', 'public-team-age', t.data.ageGroup || 'Masters'));
        const body = el('div'); body.append(el('h4', null, t.data.name || ''));
        if (t.data.description) body.append(el('p', null, t.data.description));
        const arrow = icon('arrow-up-right'); arrow.setAttribute('aria-hidden', 'true');
        card.append(body, arrow); list.append(card);
      }
      sec.append(h, list); dir.append(sec);
    }
    $('teams-body').replaceChildren(dir);
  }

  function renderFixtures(fixtures) {
    if (!fixtures.length) return;
    const wrap = el('div', 'public-fixtures');
    for (const f of fixtures.slice(0, 6)) {
      const art = el('article');
      const date = el('div', 'date-block');
      date.append(el('b', null, String(day(f.data.date).getDate())), el('span', null, day(f.data.date).toLocaleString('en-ZA', { month: 'short' })));
      const body = el('div');
      body.append(el('span', 'eyebrow', f.data.status === 'Cancelled' ? 'Cancelled · ' + f.data.type : f.data.type));
      body.append(el('h3', null, f.data.title || ''));
      if (f.kind === 'tournament') {
        let range = day(f.data.date).toLocaleDateString('en-ZA');
        if (f.data.endDate !== f.data.date) range += ' — ' + day(f.data.endDate).toLocaleDateString('en-ZA');
        body.append(el('p', null, range));
      }
      const where = el('p'); where.append(icon('map-pin'), document.createTextNode((f.data.venue || 'Venue to be confirmed') + ' ' + (f.data.time ? '· ' + f.data.time : '')));
      body.append(where);
      art.append(date, body); wrap.append(art);
    }
    $('fixtures-body').replaceChildren(wrap);
  }

  function renderNotices(notices) {
    if (!notices.length) return;
    const body = $('notices-body');
    for (const n of notices.slice(0, 4)) {
      const art = el('article'); art.append(el('h3', null, n.data.title || ''), el('p', null, n.data.body || ''));
      body.append(art);
    }
    $('notices').hidden = false;
  }

  function renderContact(contact) {
    if (!contact.email || !/^[^\s@<>"]+@[^\s@<>"]+$/.test(contact.email)) return;
    const a = el('a', null, contact.email); a.href = 'mailto:' + contact.email;
    $('footer-links').firstElementChild.after(a);
  }

  const problem = () => { const p = $('fixtures-problem'); p.textContent = 'Association updates are temporarily unavailable.'; p.hidden = false; };

  // The portal is South Africa only, so from abroad this times out; give up after 8 s.
  fetch(members + '/api/public', { credentials: 'omit', mode: 'cors', cache: 'no-cache', signal: AbortSignal.timeout(8000) })
    .then(r => r.json())
    .then(d => {
      if (d.error || !Array.isArray(d.records)) return problem();
      const records = d.records, today = new Date().toISOString().slice(0, 10);
      renderTeams(records.filter(r => r.kind === 'team'));
      renderFixtures(calendarEntries(records).filter(r => endDate(r) >= today));
      renderNotices(noticeOrder(records.filter(r => r.kind === 'announcement')));
      renderContact(d.contact || {});
    })
    .catch(problem);
})();
