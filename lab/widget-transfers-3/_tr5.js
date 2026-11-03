// Виджет трансферов, заход 5 (созвон 23.10, решение 34, п. 3.1 + общие 0.x). Основа — итог v12 (../widget-transfers-2/_tr4.js, конфиг из widgets-all/_all.js:
// hltv · v5 · gameAva · skinV1 · topAll · rows 'tint'); здесь только эта подача, без вариантов days / big / orig.
// Что иначе: дата — первой колонкой слева (U.when: ДД.ММ, низ пустой — во всех строках одинаково); колонки «Дата» справа нет;
// команды — тегами U.tag рядом с лого 16 (откуда — серым, куда — белым); значок игры 16 — своей колонкой перед фото, не на фото.
// Не менялось: шапка «Трансферы» + «Смотреть все», строки 52, наведение — цветом новой команды, состояния (главная · матч · пусто).
// Данные — window.TR_DATA (../widget-transfers/_data.js + ../widget-transfers-2/_paths.js, _mix.js). TR5.render(узел, { match: { a, b } | null })
(() => {
  const D = window.TR_DATA, U = window.U
  const dd = s => s.split('-').slice(1).reverse().join('.')
  const ini = n => n.replace(/^(Team |The )/, '').slice(0, 2).toUpperCase()
  const img = (src, n, cls) => src ? `<img class="${cls}" src="${src}" alt="" onerror="this.outerHTML='<span class=&quot;${cls} t2-ini&quot;>${ini(n)}</span>'">` : `<span class="${cls} t2-ini">${ini(n)}</span>`
  const logo = (n, cls = 't2-lg') => img((D.teams[n] || {}).logo, n, cls)
  const FACES = ['batyuk', 'davai', 'malr1ne', 'sss', 'sumail', 'ta2000', 'topson', 'wisper', 'wits', 'yuma', 'yuragi']
  const G = p => D.games.find(g => g.id === (p.game || 'dota2')) || D.game
  const ph = p => FACES.includes(p.nick.toLowerCase()) ? `<span class="t2-av t2-ph" style="background-image:url('${(window.IMGR || (x => x))(`${window.TR5_BASE || '../widget-transfers-2/'}faces/${p.nick.toLowerCase()}.webp`)}')"></span>` : img(p.photo, p.nick, 't2-av')
  // Значок игры 16 (общее 0.5): CS2 — маской цветом игры, как было
  const game = p => G(p).id === 'cs2' ? `<span class="u-game tr5-g tr5-g--cs" title="${G(p).name}"><i style="--m:url('${G(p).logo}')"></i></span>` : `<img class="u-game tr5-g" src="${G(p).logo}" alt="${G(p).name}" title="${G(p).name}">`
  // Команда: лого 16 вплотную к тегу (полное имя — в title)
  // Нет команды (пришёл из ниоткуда или ушёл в свободные агенты, как «No team» у HLTV): пустой кружок и тире — пропуск (дирижёр 23.10); «Без команды» — в подсказке
  const NONE = 'Без команды'
  const team = (n, cls) => !n ? `<span class="tr5-tm tr5-none ${cls}" title="${NONE}"><i class="tr5-nl"></i><span>—</span></span>`
    : `<span class="tr5-tm ${cls}">${logo(n, 't2-lg')}${U.tagHtml(n)}</span>`
  const href = p => `#player/${encodeURIComponent(p.nick)}` // страницы игрока пока нет
  // v4 (window.TR5_CFG.gameDate, дирижёр 23.10): игра — под датой, значок и название, как у замен v9; своей колонки у игры нет
  const GD = () => !!(window.TR5_CFG || {}).gameDate
  const gameSub = p => `<span class="tr5-wg"><img class="tr5-gi" src="${G(p).logo}" alt="">${G(p).name}</span>`
  const row = p => `<a class="t2-r tr5-r" href="${href(p)}">${GD() ? U.when({ date: dd(p.date), sub: gameSub(p) }) : U.when({ date: dd(p.date) }) + game(p)}${ph(p)}<b class="t2-nm">${p.nick}</b>
    <span class="t2-r__w tr5-w u-fit" title="${p.from || NONE} → ${p.to || NONE}">${team(p.from, 'tr5-from')}<span class="tr5-go">»</span>${team(p.to, 'tr5-to')}</span></a>`
  // пусто: матч — лого двух команд, команда — её лого, главная — без лого (дирижёр 23.10)
  const empty = (m, t) => m ? `<div class="t2-empty"><div class="t2-empty__lg">${logo(m.a, 't2-lg t2-lg--28')}${logo(m.b, 't2-lg t2-lg--28')}</div><b>Переходов нет</b><span class="t2-cap">У команд матча новых<br>трансферов нет</span></div>`
    : t ? `<div class="t2-empty"><div class="t2-empty__lg">${logo(t, 't2-lg t2-lg--28')}</div><b>Переходов нет</b><span class="t2-cap">У ${t} новых<br>трансферов нет</span></div>`
    : '<div class="t2-empty"><b>Переходов нет</b><span class="t2-cap">Новые трансферы<br>появятся здесь</span></div>'
  const chev = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'

  function render(el, o) {
    // команда (дирижёр 23.10): на странице команды — только её переходы; empty — пусто для «Все состояния»
    const m = o.match, ns = m ? [m.a, m.b] : o.team ? [o.team] : null, ps = o.empty ? [] : D.list.filter(p => !ns || ns.some(n => n === p.from || n === p.to))
    el.className = 'w t2 t2--hltv t2--v5 t2--sk t2--top t2-rows--tint tr5' + (GD() ? ' tr5--gd' : '')
    el.innerHTML = `<div class="t2-hd"><b>Трансферы</b>${ps.length && (m || o.team) ? `<span class="t2-cap">${m ? 'команды матча' : U.tag(o.team)}</span>` : ''}<a class="t2-top" href="#transfers">Смотреть все${chev}</a></div>
      <div class="w-scroll"><div class="t2-bd">${ps.length ? `<div class="t2-th tr5-th"><span>Дата</span><span>Игрок</span><span>Трансфер</span></div>${ps.map(row).join('')}`  : empty(m, o.team)}</div></div>`
    tint(el)
  }
  // Наведение — строка заливается цветом новой команды (как v12, ../widget-transfers-2/_tr4.js)
  const tone = im => { try { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 24, 24)
    const d = x.getImageData(0, 0, 24, 24).data; let r = 0, g = 0, b = 0, w = 0
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; const sat = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]); if (sat < 40) continue; r += d[i] * sat; g += d[i + 1] * sat; b += d[i + 2] * sat; w += sat }
    const R = r / w, G2 = g / w, B = b / w
    return !w || Math.max(R, G2, B) < 100 ? 'rgba(255,255,255,.1)' : `rgba(${Math.round(R)},${Math.round(G2)},${Math.round(B)},.18)` } catch (e) { return null } }
  const tint = el => el.querySelectorAll('.tr5-r').forEach(r => { const im = r.querySelector('.tr5-to img'); if (!im) return
    const f = () => { const c = tone(im); if (c) r.style.setProperty('--tint', c) }; im.complete ? f() : im.addEventListener('load', f, { once: true }) })
  window.TR5 = { render }
})()
