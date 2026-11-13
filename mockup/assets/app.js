/* MarineSense mockup — shared script: theme, top menu, chat box, 3D scene. All data is invented sample data. */
(function () {
  const MS = (window.MS = {});
  const root = document.documentElement;
  const $ = (MS.$ = (sel, el) => (el || document).querySelector(sel));
  const el = (MS.el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; });

  MS.ST = [{ k: 'ok', t: 'Normal' }, { k: 'warn', t: 'Watch' }, { k: 'crit', t: 'Act now' }];
  MS.wave = (k, base, amp) => base + amp * Math.sin(k * 0.9) + amp * 0.5 * Math.sin(k * 2.3 + 1);

  /* ---------- Theme ---------- */
  let theme = 'light';
  try { theme = localStorage.getItem('ms-theme') || 'light'; } catch (e) { /* storage blocked */ }
  root.dataset.theme = theme;
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.500 10.500z"/></svg>';
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.600 5.600 7 7M17 17l1.400 1.400M5.600 18.400 7 17M17 7l1.400-1.400"/></svg>';
  function paintTheme() {
    const b = $('.theme');
    if (!b) return;
    const dark = theme === 'dark';
    b.innerHTML = (dark ? SUN : MOON) + (dark ? 'Light' : 'Dark');
    b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try { localStorage.setItem('ms-theme', theme); } catch (e) { /* storage blocked */ }
    paintTheme();
  }

  /* ---------- Top menu ---------- */
  const ICON = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  const PAGES = [
    ['main', 'index.html', 'Bridge', 'M4 13a8 8 0 0 1 16 0M12 13l4-4M3 19h18'],
    ['twin', 'twin.html', 'Digital twin', 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5'],
    ['advisory', 'advisory.html', 'Advisories', 'M12 4l9 16H3L12 4zM12 10v4M12 17v.5', '<span class="count">1</span>'],
    ['manuals', 'manuals.html', 'Manuals', 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4zM5 17a3 3 0 0 1 3-3h11'],
    ['maintenance', 'maintenance.html', 'Maintenance', 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4', '<span class="count soft">2</span>'],
    ['setup', 'setup.html', 'Ship setup', 'M4 7h10M18 7h2M4 17h2M10 17h10M16 5v4M8 15v4'],
  ];
  function buildMenu() {
    const host = $('#menu');
    if (!host) return;
    const active = document.body.dataset.page;
    host.className = 'menu';
    host.innerHTML =
      '<a class="brand" href="index.html"><i aria-hidden="true"></i>MarineSense</a>' +
      '<nav aria-label="Main">' + PAGES.map((p) =>
        '<a href="' + p[1] + '"' + (p[0] === active ? ' class="on" aria-current="page"' : '') + '>' + ICON(p[3]) + p[2] + (p[4] || '') + '</a>').join('') + '</nav>' +
      '<div class="pill"><span class="dot c-ok" style="animation:blink 1.2s infinite"></span>2,418 signals live</div>' +
      '<button type="button" class="theme"></button>' +
      '<div class="who"><div><b>[CHIEF ENGINEER NAME]</b><span class="small mute">Chief Engineer · on watch</span></div><span class="avatar" aria-hidden="true">CE</span></div>';
    $('.theme', host).addEventListener('click', toggleTheme);
    paintTheme();
  }

  /* ---------- Chat box ---------- */
  const QA = [
    { label: 'Exhaust valve overhaul interval?', q: 'How often must the exhaust valves be overhauled?',
      a: 'Every 8,000 running hours on this engine. The valve on cylinder 4 is at 7,940 hours and already leaking, so I booked its overhaul for the next port stay.',
      steps: [], cite: 'Main Engine Manual · Vol 3 · §2.1 · p. 41' },
    { label: 'Reset the oil mist alarm?', q: 'How do I reset the oil mist detector alarm?',
      a: 'Do not reset it until you know the crankcase is safe. Then:',
      steps: ['Reduce engine load and tell the bridge.', 'Read which crankcase section raised the alarm.', 'Wait until the reading is back under the alarm line.', 'Press and hold RESET for 3 seconds.', 'If it comes straight back, stop. Keep crankcase doors closed.'],
      cite: 'Oil Mist Detector Manual · §6.2 · p. 18' },
    { label: 'Why is purifier 2 vibrating?', q: 'Why is purifier 2 vibrating?',
      a: 'Most likely sludge has built up unevenly in the bowl. Vibration rose from 3.1 to 7.1 mm/s in three days, which matches the manual. Do this:',
      steps: ['Stop purifier 2 and switch to purifier 1.', 'Open the bowl and clean it.', 'Check the disc stack order.', 'Restart it and tell me. I will compare the vibration.'],
      cite: 'Fuel Oil Purifier Manual · §7.4 · p. 63' },
  ];
  const HELLO = 'Good watch, Chief. Ask me anything about this ship or its manuals. I answer in plain words and show you the page I used.';
  const FALLBACK = 'This is a concept mockup, so I can only answer the three sample questions below. On a real ship I would search all 14 manuals and the live signals, and tell you if they do not cover it.';
  let chat, log, typing;

  function say(text, steps, cite) {
    const m = el('<div class="msg"><div></div></div>');
    log.append(m);
    clearInterval(typing);
    let n = 0;
    typing = setInterval(() => {
      n += 3;
      m.firstChild.textContent = text.slice(0, n);
      log.scrollTop = log.scrollHeight;
      if (n < text.length) return;
      clearInterval(typing);
      if (steps && steps.length) m.append(el('<ol>' + steps.map((s, i) => '<li><i>' + (i + 1) + '</i><span>' + s + '</span></li>').join('') + '</ol>'));
      if (cite) m.append(el('<a href="manuals.html">' + cite + '</a>'));
      log.scrollTop = log.scrollHeight;
    }, 20);
  }
  function ask(item) {
    const me = el('<div class="msg me"></div>');
    me.textContent = item.q;
    log.append(me);
    say(item.a, item.steps, item.cite);
  }
  function setOpen(open) {
    chat.classList.toggle('open', open);
    $('.chat-fab span:last-child', chat).textContent = open ? 'Minimise' : 'Ask MarineSense';
    $('.chat-fab', chat).setAttribute('aria-expanded', String(open));
    if (open && !log.childElementCount) say(HELLO);
  }
  MS.openChat = () => setOpen(true);
  function buildChat() {
    chat = el(
      '<div class="chat">' +
        '<section class="chat-panel" aria-label="Ask MarineSense">' +
          '<div class="chat-head"><span class="orb" aria-hidden="true"></span><div><b class="display" style="font-size:16px">Ask MarineSense</b><small>14 manuals · 2,418 live signals</small></div><button type="button" aria-label="Minimise chat">–</button></div>' +
          '<div class="chat-log" aria-live="polite"></div>' +
          '<div class="chat-foot"><div class="chips"></div>' +
            '<form class="ask"><label class="sr" for="ms-ask">Your question</label><input id="ms-ask" type="text" placeholder="Ask in your own words…" autocomplete="off"><button type="submit" class="btn primary">Ask</button></form>' +
          '</div>' +
        '</section>' +
        '<button type="button" class="chat-fab"><span class="orb" aria-hidden="true"></span><span>Ask MarineSense</span></button>' +
      '</div>');
    document.body.append(chat);
    log = $('.chat-log', chat);
    QA.forEach((item) => {
      const b = el('<button type="button"></button>');
      b.textContent = item.label;
      b.addEventListener('click', () => ask(item));
      $('.chips', chat).append(b);
    });
    $('.chat-head button', chat).addEventListener('click', () => setOpen(false));
    $('.chat-fab', chat).addEventListener('click', () => setOpen(!chat.classList.contains('open')));
    $('.ask', chat).addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#ms-ask');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      ask({ q: text, a: FALLBACK });
    });
    setOpen(document.body.dataset.chat === 'open' && window.innerWidth > 900);
    document.addEventListener('click', (e) => { if (e.target.closest('[data-open-chat]')) MS.openChat(); });
  }

  /* ---------- Digital twin data: four levels, vessel down to a single part ---------- */
  const OKSAY = 'All readings are inside the normal range. Nothing for you to do here.';
  const cyl = (i, temp) => ({ id: 'c' + i, n: 'Cyl ' + i, full: 'Cylinder unit ' + i, b: [5 + 15.5 * (i - 1), 17 + 15.5 * (i - 1), -8, 8, 26, 52], st: 0, say: OKSAY,
    sig: [['Exhaust temp', temp, 2, '°C', 0, 'limit 450'], ['Fuel index', 70, 0.5, '%', 0, 'same as the others']] });
  const gen = (i, x, load, note) => ({ id: 'g' + i, n: 'Generator ' + i, b: [x, x + 22, 22, 34, 0, 12], st: 0, say: OKSAY,
    sig: [['Load', load, load ? 1.5 : 0, '%', 0, note], ['Oil pressure', load ? 4.6 : 0, load ? 0.1 : 0, 'bar', 1, load ? 'normal' : 'stopped']] });
  const c4 = Object.assign(cyl(4, 462), { st: 2, to: 'cyl', ref: 'Main Engine Manual · Vol 2 · §4 Cylinder unit',
    say: 'This is the hot one. The most likely cause is the exhaust valve at the top of this cylinder not sealing fully. Zoom in and I will show you.' });
  MS.levels = {
    ship: { name: 'Vessel', label: 'the vessel', parent: null, o: [150, 0, 14], s: 3.0, hull: true, parts: [
      { id: 'er', n: 'Engine room', b: [20, 58, -15, 15, 2, 19], st: 2, to: 'er', la: [39, 46, -14],
        say: 'One machine in this room needs you: the main engine. Cylinder 4 is running too hot. Zoom in and I will take you to it.',
        sig: [['Cylinder 4 exhaust temp', 462, 3, '°C', 0, 'limit 450'], ['Main engine load', 82, 1, '%', 0, 'normal'], ['Engine room air temp', 41, 0.4, '°C', 1, 'normal']] },
      { id: 'acc', n: 'Bridge and cabins', b: [22, 50, -16, 16, 21, 44], st: 0, la: [36, 0, 74], say: OKSAY,
        sig: [['Fire detection loops', 12, 0, 'of 12', 0, 'healthy'], ['Emergency power', 100, 0, '%', 0, 'ready']] },
      { id: 'sg', n: 'Steering gear', b: [3, 16, -12, 12, 8, 19], st: 0, la: [4, 0, 40], say: OKSAY,
        sig: [['Hydraulic oil pressure', 142, 2, 'bar', 0, 'normal'], ['Rudder angle', 2.5, 1.5, '°', 1, 'following the order']] },
      { id: 'cargo', n: 'Cargo holds 1 to 5', b: [62, 230, -18, 18, 2, 19], st: 0, la: [146, 0, 48], say: OKSAY,
        sig: [['Hold bilge level', 0.04, 0.01, 'm', 2, 'dry'], ['Hold 3 temperature', 24, 0.3, '°C', 1, 'normal']] },
      { id: 'fwd', n: 'Ballast and forepeak', b: [236, 285, -10, 10, 2, 19], st: 1, la: [262, 0, 52],
        say: 'Ballast pump 1 bearing is warmer than usual. No action yet. I am watching it and will tell you if it keeps climbing.',
        sig: [['Ballast pump 1 bearing temp', 78, 1.5, '°C', 0, 'watch above 85'], ['Forepeak tank level', 6.2, 0.02, 'm', 2, 'normal']] },
    ] },
    er: { name: 'Engine room', label: 'the engine room', parent: 'ship', o: [60, 0, 16], s: 5.6, frame: [[0, 120, -42, 42, 0, 44]], lines: [[[0, 0, 8], [28, 0, 8]]], parts: [
      { id: 'me', n: 'Main engine', b: [28, 92, -9, 9, 0, 30], st: 2, to: 'me', la: [60, 0, 46], ref: 'Main Engine Manual · Vol 2 · Operation',
        say: 'Cylinder 4 is 58 °C hotter than the other five. Fuel, air and cooling to the engine all look normal, so the cause is inside that one cylinder.',
        sig: [['Cylinder 4 exhaust temp', 462, 3, '°C', 0, 'limit 450'], ['Average of other cylinders', 404, 1, '°C', 0, 'normal'], ['Engine speed', 96, 0.4, 'rpm', 0, 'normal']] },
      gen(1, 10, 62, 'sharing load'), gen(2, 40, 58, 'sharing load'), gen(3, 70, 0, 'standby, ready'),
      { id: 'blr', n: 'Boiler', b: [98, 114, -36, -20, 0, 30], st: 0, say: OKSAY, sig: [['Steam pressure', 6.8, 0.1, 'bar', 1, 'normal'], ['Water level', 52, 1, '%', 0, 'normal']] },
      { id: 'pur', n: 'Fuel purifiers', b: [8, 30, -38, -24, 0, 12], st: 1, ref: 'Fuel Oil Purifier Manual · §7.4 Vibration',
        say: 'Purifier 2 vibration has been rising for 3 days. Plan a bowl clean within 48 hours. I have added it to the maintenance plan.',
        sig: [['Purifier 2 vibration', 7.1, 0.4, 'mm/s', 1, 'watch above 9'], ['Purifier 1 vibration', 3.2, 0.2, 'mm/s', 1, 'normal']] },
      { id: 'cw', n: 'Cooling pumps', b: [44, 84, -38, -28, 0, 8], st: 0, say: OKSAY, sig: [['Jacket water outlet temp', 81, 0.6, '°C', 1, 'normal'], ['Sea water pressure', 2.1, 0.05, 'bar', 2, 'normal']] },
    ] },
    me: { name: 'Main engine', label: 'the main engine', parent: 'er', o: [50, 2, 28], s: 5.4, frame: [[0, 100, -12, 12, 0, 8], [2, 98, -10, 10, 8, 26]], parts: [
      cyl(1, 402), cyl(2, 406), cyl(3, 405), c4, cyl(5, 403), cyl(6, 404),
      { id: 'tc', n: 'Turbocharger', b: [60, 84, 14, 26, 34, 50], st: 0, la: [72, 44, 30], say: OKSAY, sig: [['Speed', 14200, 60, 'rpm', 0, 'normal'], ['Exhaust temp after turbine', 268, 2, '°C', 0, 'normal']] },
      { id: 'fp', n: 'Fuel pumps', b: [20, 52, -20, -13, 18, 30], st: 0, la: [22, -40, 54], say: OKSAY, sig: [['Fuel pressure', 8.1, 0.1, 'bar', 1, 'normal'], ['Fuel temperature', 132, 0.5, '°C', 0, 'normal']] },
    ] },
    cyl: { name: 'Cylinder unit 4', label: 'cylinder unit 4', parent: 'me', o: [0, 0, 52], s: 4.7, frame: [[-17, 17, -17, 17, 0, 104]], parts: [
      { id: 'ev', n: 'Exhaust valve', b: [-6, 6, -6, 6, 78, 100], st: 2, la: [-40, 0, 96], ref: 'Main Engine Manual · Vol 2 · §4.3 Exhaust valve',
        say: 'Gas leaving this cylinder is 462 °C and the valve is turning slower than it should. The valve is probably not closing tight, so hot gas leaks past it. Reduce load first, then check the valve. I will guide you.',
        sig: [['Exhaust temp after valve', 462, 3, '°C', 0, 'limit 450'], ['Valve rotation', 0.4, 0.05, 'turns/min', 1, 'should be about 1'], ['Valve hydraulic pressure', 198, 2, 'bar', 0, 'normal']] },
      { id: 'fi', n: 'Fuel injectors', b: [8, 12, -3, 3, 78, 90], st: 0, la: [42, 0, 96], say: OKSAY, sig: [['Fuel index', 71, 0.5, '%', 0, 'same as the others']] },
      { id: 'cc', n: 'Cylinder cover', b: [-13, 13, -13, 13, 68, 78], st: 0, la: [44, 0, 72], say: OKSAY, sig: [['Cover cooling outlet temp', 83, 0.5, '°C', 0, 'normal']] },
      { id: 'ln', n: 'Cylinder liner', b: [-11, 11, -11, 11, 26, 68], st: 0, la: [-42, 0, 60], say: OKSAY, sig: [['Liner wall temp', 148, 1, '°C', 0, 'normal']] },
      { id: 'ps', n: 'Piston and rings', b: [-9, 9, -9, 9, 42, 54], st: 0, la: [44, 0, 44], say: OKSAY, sig: [['Piston cooling oil outlet', 54, 0.4, '°C', 0, 'normal']] },
      { id: 'pr', n: 'Piston rod', b: [-3, 3, -3, 3, 4, 42], st: 0, la: [-40, 0, 20], say: OKSAY, sig: [['Piston cooling oil flow', 100, 0, '%', 0, 'normal']] },
    ] },
  };

  /* ---------- 3D wireframe scene ---------- */
  const HULL = [[0, -18], [0, 18], [10, 22], [230, 22], [265, 16], [288, 7], [300, 0], [288, -7], [265, -16], [230, -22], [10, -22]];
  MS.Scene = class {
    constructor(host, opts) {
      this.o = Object.assign({ w: 1000, h: 600, level: 'ship', labels: 'all' }, opts);
      this.host = host;
      this.yaw = -0.5; this.auto = true; this.t = 0;
      host.classList.add('scene');
      host.innerHTML = '<div class="stage"><svg viewBox="0 0 ' + this.o.w + ' ' + this.o.h + '" role="img"></svg><div class="hots"></div></div>';
      this.svg = $('svg', host); this.hots = $('.hots', host);
      this.setLevel(this.o.level);
      this.timer = setInterval(() => { this.t++; this.draw(); }, 60);
    }
    get level() { return MS.levels[this.lv]; }
    get part() { return this.level.parts.find((p) => p.id === this.sel); }
    setLevel(id) {
      this.lv = id;
      const parts = this.level.parts;
      this.sel = parts.reduce((a, p) => (p.st > a.st ? p : a), parts[0]).id;
      this.svg.setAttribute('aria-label', '3D view of ' + this.level.label + ' with ' + parts.length + ' parts');
      this.hots.innerHTML = '';
      this.labels = parts.filter((p) => this.o.labels === 'all' || p.st > 0).map((p) => {
        const st = MS.ST[p.st];
        const b = el(this.o.href ? '<a class="hot" href="' + this.o.href + '"></a>' : '<button type="button" class="hot"></button>');
        b.classList.add(st.k);
        b.innerHTML = '<span class="dot c-' + st.k + (p.st === 2 ? ' sq' : '') + '"></span>' + p.n + (p.st ? ' <em class="c-' + st.k + '">' + st.t + '</em>' : '');
        if (!this.o.href) b.addEventListener('click', () => this.pick(p.id));
        this.hots.append(b);
        return { p, b };
      });
      this.host.classList.remove('zoom'); void this.host.offsetWidth; this.host.classList.add('zoom');
      this.draw();
      this.changed();
    }
    pick(id) { this.sel = id; this.draw(); this.changed(); }
    changed() { if (this.o.onChange) this.o.onChange(this); }
    P(p, v) {
      const x = p[0] - v.o[0], y = p[1] - v.o[1], z = p[2] - v.o[2], c = Math.cos(v.yaw), s = Math.sin(v.yaw);
      return [v.cx + (x * c - y * s) * v.s, v.cy + ((x * s + y * c) * 0.42 - z * 0.9) * v.s];
    }
    L(pts, v, close) { return 'M' + pts.map((p) => { const q = this.P(p, v); return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + (close ? 'Z' : ''); }
    T(b, v) { return this.L([[b[0], b[2], b[5]], [b[1], b[2], b[5]], [b[1], b[3], b[5]], [b[0], b[3], b[5]]], v, true); }
    B(b, v) {
      const f = (a) => this.L(a, v, true);
      return f([[b[0], b[2], b[4]], [b[1], b[2], b[4]], [b[1], b[3], b[4]], [b[0], b[3], b[4]]]) + this.T(b, v)
        + f([[b[0], b[2], b[4]], [b[1], b[2], b[4]], [b[1], b[2], b[5]], [b[0], b[2], b[5]]])
        + f([[b[0], b[3], b[4]], [b[1], b[3], b[4]], [b[1], b[3], b[5]], [b[0], b[3], b[5]]]);
    }
    draw() {
      const lvl = this.level, w = this.o.w, h = this.o.h;
      const v = { yaw: this.yaw + (this.auto ? 0.2 * Math.sin(this.t * 0.012) : 0), cx: w / 2, cy: h * 0.53, s: lvl.s * w / 1000 * (this.o.zoom || 1), o: lvl.o };
      let hull = '', deck = '', upper = '';
      if (lvl.hull) {
        const at = (k, z) => HULL.map((p) => [p[0] * (1 - 0.05 * k) + 8 * k, p[1] * (1 - 0.24 * k), z]);
        const d = at(0, 20), keel = at(1, 0);
        deck = this.L(d, v, true);
        hull = deck + this.L(at(0.5, 10), v, true) + this.L(keel, v, true);
        d.forEach((p, i) => { hull += this.L([p, keel[i]], v); });
        for (let x = 40; x <= 220; x += 30) hull += this.L([[x, -22, 20], [x, -17, 0], [x, 17, 0], [x, 22, 20]], v);
        upper = this.B([38, 50, -22, 22, 44, 50], v) + this.B([24, 32, -5, 5, 44, 60], v) + this.L([[280, 0, 20], [280, 0, 40]], v);
        if (this.o.labels !== 'all') upper += this.B([22, 50, -16, 16, 20, 44], v);
        for (let i = 0; i < 5; i++) upper += this.B([64 + 33 * i, 90 + 33 * i, -14, 14, 20, 23], v);
      }
      (lvl.frame || []).forEach((b) => { hull += this.B(b, v); });
      (lvl.lines || []).forEach((l) => { upper += this.L(l, v); });
      const wire = ['', '', ''], top = ['', '', ''];
      let lead = '', sel = '';
      lvl.parts.forEach((p) => {
        wire[p.st] += this.B(p.b, v); top[p.st] += this.T(p.b, v);
        if (p.id === this.sel && this.o.labels === 'all') sel = this.B(p.b, v);
      });
      this.labels.forEach(({ p, b }) => {
        const c = [(p.b[0] + p.b[1]) / 2, (p.b[2] + p.b[3]) / 2, (p.b[4] + p.b[5]) / 2];
        const la = p.la || [c[0], c[1], p.b[5] + 9];
        lead += this.L([[c[0], c[1], p.la ? c[2] : p.b[5]], la], v);
        const q = this.P(la, v);
        b.style.left = (q[0] / w * 100).toFixed(2) + '%';
        b.style.top = (q[1] / h * 100).toFixed(2) + '%';
        b.classList.toggle('on', p.id === this.sel && this.o.labels === 'all');
      });
      const e = (rx, ry) => '<ellipse class="ring" cx="' + w / 2 + '" cy="' + h * 0.63 + '" rx="' + w * rx + '" ry="' + h * ry + '"/>';
      const path = (cls, d) => (d ? '<path class="' + cls + '" d="' + d + '"/>' : '');
      this.svg.innerHTML = e(0.47, 0.25) + e(0.32, 0.17) + e(0.17, 0.09)
        + path('deck', deck) + path('hull', hull) + path('upper', upper)
        + path('ok-t', top[0]) + path('ok-w', wire[0]) + path('warn-t', top[1]) + path('warn-w', wire[1])
        + path('crit-t', top[2]) + path('crit-w', wire[2]) + path('sel', sel) + path('lead', lead);
    }
  };

  buildMenu();
  document.addEventListener('DOMContentLoaded', buildChat);
})();
