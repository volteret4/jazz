// Registro de estilos y escenas del jazz. Cada fichero de capítulo (data/NN-*.js, escritos
// a mano leyendo el libro) llama a JAZZ.chapter({...}) y JAZZ.add([...], n).
// Los datos se fusionan por id: los arrays se unen y cada capítulo puede añadir
// discos, citas (refs) y una nota propia sobre una escena ya definida en otro.
window.JAZZ = (function () {
  const genres = new Map();
  const chapters = [];

  const FAMILIES = {
    raices:   { name: 'Raíces: África, blues, ragtime y espirituales', color: '#f59e0b' },
    nola:     { name: 'Nueva Orleans, Chicago y jazz clásico', color: '#facc15' },
    swing:    { name: 'Swing, Harlem y big bands', color: '#fb923c' },
    piano:    { name: 'Piano y voces: stride, boogie y cantantes', color: '#f472b6' },
    bebop:    { name: 'Bebop y jazz moderno', color: '#60a5fa' },
    cool:     { name: 'Cool, West Coast y third stream', color: '#67e8f9' },
    hardbop:  { name: 'Hard bop, soul jazz y post-bop', color: '#a78bfa' },
    free:     { name: 'Free jazz y vanguardia', color: '#fb7185' },
    fusion:   { name: 'Fusión: jazz-rock, ECM y músicas del mundo', color: '#a3e635' },
    actual:   { name: 'Tradicionalistas y jazz contemporáneo', color: '#94a3b8' },
  };

  const key = (t) => (t.a + '|' + t.t).toLowerCase();

  function mergeArr(a = [], b = [], k = (x) => (typeof x === 'string' ? x.toLowerCase() : JSON.stringify(x))) {
    const seen = new Set(a.map(k));
    const out = a.slice();
    for (const x of b) if (!seen.has(k(x))) { seen.add(k(x)); out.push(x); }
    return out;
  }

  // Anota en cada disco los capítulos que lo citan.
  function cite(tracks, t, ch) {
    const m = tracks.find((x) => key(x) === key(t));
    if (m && ch != null) m.chs = mergeArr(m.chs, [ch]);
  }

  function add(list, chapter) {
    for (const g of list) {
      let cur = genres.get(g.id);
      if (!cur) {
        cur = { id: g.id, aka: [], influences: [], artists: [], tracks: [], labels: [], refs: [], notes: [], chapters: [] };
        genres.set(g.id, cur);
      }
      for (const f of ['aka', 'influences', 'artists', 'labels']) cur[f] = mergeArr(cur[f], g[f]);
      cur.tracks = mergeArr(cur.tracks, (g.tracks || []).map((t) => ({ ...t })), key);
      for (const t of g.tracks || []) {
        if (t.ess) { const m = cur.tracks.find((x) => key(x) === key(t)); if (m) m.ess = 1; }
        cite(cur.tracks, t, chapter);
      }
      cur.refs = mergeArr(cur.refs, (g.refs || []).map((r) => ({ ch: chapter, ...r })), (r) => r.q);
      for (const f of ['name', 'family', 'start', 'end', 'place', 'desc']) if (g[f] != null && cur[f] == null) cur[f] = g[f];
      if (g.desc != null) cur.descCh = cur.descCh ?? chapter;
      if (g.note) cur.notes.push({ ch: chapter, text: g.note });
      if (chapter != null && !cur.chapters.includes(chapter)) cur.chapters.push(chapter);
    }
  }

  return {
    FAMILIES,
    chapters,
    genres,
    chapter(meta) { chapters.push(meta); },
    add,
  };
})();
