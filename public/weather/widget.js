/* Shared dependency-free ARSO card for the guest portal and TV preview.
 * Remote text is rendered with textContent, never interpreted as HTML. */
(() => {
  if (customElements.get('arso-weather')) return;
  const labels = {
    en: ['Weather in Bled', 'Current estimate', 'Updated', 'Last available data', 'Weather is temporarily unavailable', 'Loading weather…', 'Source: ARSO'],
    sl: ['Vreme na Bledu', 'Trenutna ocena', 'Posodobljeno', 'Zadnji razpoložljivi podatki', 'Vreme trenutno ni na voljo', 'Nalaganje vremena…', 'Vir: ARSO'],
    de: ['Wetter in Bled', 'Aktuelle Schätzung', 'Aktualisiert', 'Letzte verfügbare Daten', 'Wetter derzeit nicht verfügbar', 'Wetter wird geladen…', 'Quelle: ARSO'],
    hr: ['Vrijeme na Bledu', 'Trenutačna procjena', 'Ažurirano', 'Posljednji dostupni podaci', 'Vrijeme trenutačno nije dostupno', 'Učitavanje vremena…', 'Izvor: ARSO'],
    sr: ['Vreme na Bledu', 'Trenutna procena', 'Ažurirano', 'Poslednji dostupni podaci', 'Vreme trenutno nije dostupno', 'Učitavanje vremena…', 'Izvor: ARSO']
  };
  const conditions = {
    en: ['Clear', 'Partly cloudy', 'Cloudy', 'Rain', 'Snow', 'Thunderstorms', 'Fog', ''],
    sl: ['Jasno', 'Delno oblačno', 'Oblačno', 'Dež', 'Sneg', 'Nevihte', 'Megla', ''],
    de: ['Klar', 'Teilweise bewölkt', 'Bewölkt', 'Regen', 'Schnee', 'Gewitter', 'Nebel', ''],
    hr: ['Vedro', 'Djelomično oblačno', 'Oblačno', 'Kiša', 'Snijeg', 'Grmljavina', 'Magla', ''],
    sr: ['Vedro', 'Delimično oblačno', 'Oblačno', 'Kiša', 'Sneg', 'Grmljavina', 'Magla', '']
  };
  const kinds = ['sun', 'partly', 'cloud', 'rain', 'snow', 'storm', 'fog', 'unknown'];
  const cloud = 'M6 16a4 4 0 1 1 1-8 5 5 0 0 1 9 1 3.5 3.5 0 1 1 1 7Z';
  const paths = {
    sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    cloud, partly: cloud + 'M5 2v2M1 6l2 1M10 3 9 5',
    rain: cloud + 'M8 19l-1 3m6-3-1 3m6-3-1 3',
    snow: cloud + 'M8 19v3m-1-1.5h2m6-1.5v3m-1-1.5h2',
    storm: cloud + 'M13 16l-3 4h4l-3 4',
    fog: cloud + 'M4 20h16M7 23h10',
    unknown: 'M8 8a4 4 0 1 1 6 3c-2 1-2 2-2 3m0 3v1'
  };
  function icon(kind) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 26');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', paths[kind] || paths.unknown);
    svg.append(path);
    return svg;
  }
  function node(tag, text, cls) {
    const el = document.createElement(tag);
    if (text != null) el.textContent = text;
    if (cls) el.className = cls;
    return el;
  }
  class ArsoWeather extends HTMLElement {
    static get observedAttributes() { return ['lang', 'tv-mode']; }
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      if (!this.data && globalThis.arsoWeatherPreviewSnapshot) {
        this.data = globalThis.arsoWeatherPreviewSnapshot;
        this.failed = true;
      }
      this.render();
      this.refresh();
      this.timer = setInterval(() => this.refresh(), 300_000);
    }
    disconnectedCallback() { clearInterval(this.timer); this.controller?.abort(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    async refresh() {
      if (this.loading) return;
      this.loading = true;
      this.controller = new AbortController();
      const timeout = setTimeout(() => this.controller.abort(), 10000);
      try {
        const response = await fetch(globalThis.TV_PORTAL_BASE ? `${globalThis.TV_PORTAL_BASE}/api/public/weather` : this.getAttribute('endpoint') || '/api/public/weather',
          { credentials: 'omit', cache: 'no-store', signal: this.controller.signal });
        if (!response.ok) throw new Error('Unavailable');
        const data = await response.json();
        if (!Number.isFinite(Date.parse(data.issuedAt)) || !Array.isArray(data.days) || data.days.length < 3) throw new Error('Invalid data');
        this.data = data;
        this.failed = false;
      } catch { this.failed = true; }
      finally { clearTimeout(timeout); this.loading = false; if (this.isConnected) this.render(); }
    }
    getForecast() {
      const data = this.data;
      const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Ljubljana', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      if (!data || Date.now() - Date.parse(data.issuedAt) >= 6 * 3600_000 || data.days?.length < 5 || data.days[0]?.date !== date) return null;
      return { ...data, stale: data.stale || this.failed, days: data.days.slice(0, 5) };
    }
    createIcon(kind) { return icon(kind); }
    describeCondition(kind, lang = this.lang) {
      return (conditions[lang] || conditions.en)[kinds.indexOf(kind)] || '';
    }
    render() {
      const lang = Object.hasOwn(labels, this.lang) ? this.lang : 'en';
      const text = labels[lang];
      const data = this.data;
      const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Ljubljana', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      const usable = data && Date.now() - Date.parse(data.issuedAt) < 6 * 3600_000 && data.days[0]?.date === date;
      const style = node('style', `
        :host{display:block;font-family:inherit;color:#fffdf8;min-width:0}
        *{box-sizing:border-box}.card{background:var(--weather-card-background,#172536);border:1px solid #526074;border-radius:16px;padding:20px}
        h2{font-size:1.15em;font-weight:600;margin:0 0 18px}.current{display:flex;align-items:center;gap:18px;margin-bottom:18px}
        svg{width:52px;height:56px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
        .current svg{width:72px;height:78px}.temperature{font-size:2.6em;font-weight:600;line-height:1.1}
        .muted{font-size:.8em;color:#d3dae2;margin:5px 0}.days{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
        .day{text-align:center;border-top:1px solid #526074;padding-top:14px;min-width:0}
        .day p{margin:6px 0;font-size:.85em;overflow-wrap:anywhere}.day svg{display:block;margin:8px auto}.low{color:#b8c5ef}
        footer{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-top:18px;font-size:.65em;color:#d3dae2}
        a{color:inherit}a:focus-visible{outline:2px solid white;outline-offset:4px}.status{line-height:1.5}
        @media(min-width:1400px){:host{font-size:22px}.card{padding:24px}}
        @media(max-width:360px){.card{padding:14px}.days{gap:4px}}
      `);
      const card = node('section', null, 'card');
      card.setAttribute('aria-label', text[0]);
      card.append(node('h2', text[0]));
      const description = kind => conditions[lang][Math.max(0, kinds.indexOf(kind))] || '';
      if (usable) {
        const current = data.current;
        if (current && Date.now() - Date.parse(current.validAt) < 6 * 3600_000) {
          const row = node('div', null, 'current');
          const info = node('div');
          info.append(node('div', `${current.temperature}°`, 'temperature'),
            node('p', description(current.condition), 'muted'),
            node('p', `${text[1]} · ${new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Ljubljana' }).format(new Date(current.validAt))}`, 'muted'));
          row.append(icon(current.condition), info);
          card.append(row);
        }
        const days = node('div', null, 'days');
        for (const day of data.days.slice(0, 3)) {
          const col = node('div', null, 'day');
          col.append(node('p', new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric', timeZone: 'Europe/Ljubljana' }).format(new Date(`${day.date}T12:00:00Z`))),
            icon(day.condition), node('p', description(day.condition)),
            node('p', `${day.max}° / ${day.min}°`));
          days.append(col);
        }
        card.append(days);
      } else {
        card.append(node('p', this.failed || data ? text[4] : text[5], 'status'));
      }
      const footer = node('footer');
      const link = node(this.hasAttribute('tv-mode') ? 'span' : 'a', text[6]);
      link.href = 'https://vreme.arso.gov.si/napoved/Bled/graf';
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      footer.append(link);
      if (usable) footer.append(node('span', `${data.stale || this.failed ? text[3] : text[2]} · ${new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Ljubljana' }).format(new Date(data.issuedAt))}`));
      card.append(footer);
      this.shadowRoot.replaceChildren(style, card);
    }
  }
  customElements.define('arso-weather', ArsoWeather);
})();
