// w-graph-2 — график страницы матча (созвон 05.11 §3, задача 3): подсказка драки — герои иконками мини-карты (3.1), кнопка «вся карта» — не «на весь экран» (3.2)
// WGX = true · WGX_GREY — иконки погибших серые · WGX_IC: 'fit' — стрелки к краям |↔| · 'back' — круговая стрелка «вернуть» · 'txt' — словами «Вся карта»
(() => { if (!window.WGX) return; const H = document.documentElement; H.classList.add('wgx');
  if (window.WGX_GREY) H.classList.add('wgx-grey'); if (window.WGX_IC) H.classList.add('wgx-ic-' + window.WGX_IC);
  // портрет героя → иконка мини-карты (gs-match/img/heroes/icon/), нет иконки — остаётся портрет
  // в подсказке драки герой берётся из данных графика (S.ds), а сама подсказка перерисовывается каждый кадр — поэтому меняем картинку героя в данных, а не в разметке
  // иконки мини-карты есть не на всех героев (gs-match/img/heroes/icon/) — нет иконки, остаётся портрет
  const ICONS = new Set('abyssal_underlord alchemist axe bane bounty_hunter centaur chaos_knight clinkz crystal_maiden dark_seer dark_willow dawnbreaker dazzle doom_bringer dragon_knight drow_ranger earth_spirit earthshaker elder_titan ember_spirit enchantress enigma faceless_void furion grimstroke hoodwink huskar invoker keeper_of_the_light kez largo life_stealer lina lion lone_druid lycan mirana monkey_king necrolyte nevermore night_stalker ogre_magi pangolier phantom_lancer primal_beast puck rattletrap razor ringmaster rubick sand_king shadow_demon shredder slardar slark snapfire spirit_breaker storm_spirit sven templar_assassin terrorblade tidehunter treant tusk undying viper void_spirit windrunner winter_wyvern wisp'.split(' '));
  const ic = h => { if (!h || h.__wgx) return h; const m = (h.img || '').match(/^(.*heroes\/)([\w]+)\.png$/); return m && ICONS.has(m[2]) ? { ...h, img: m[1] + 'icon/' + m[2] + '.png', __wgx: 1 } : h; };
  const wrap = () => { if (!window.WG2 || WG2.__wgx) return; const f = WG2.render; WG2.__wgx = 1;
    WG2.render = function (el, ...a) { const r = f.call(this, el, ...a), S = el && el._g2; if (S && S.ds) S.ds.forEach(d => { d.h = ic(d.h); d.kh = ic(d.kh); }); return r; }; };
  wrap(); document.addEventListener('DOMContentLoaded', wrap);
  // WGX_NO12 (дирижёр 05.11): точка 12′ на линии нужна, только пока настоящего графика до 12′ нет (до матча, первые 12 минут); график прошёл 12′ — точки нет
  // WGX_NO12 (дирижёр 05.11): после 12′ блока «Линии» тоже нет — клик по полю 0–12′ его не открывает (по ромбам драк — как раньше)
  if (window.WGX_NO12) document.addEventListener('click', e => { const w = e.target.closest && e.target.closest('.wgx-p12'); if (!w || e.target.closest('.dm, .g2-pop, .g2-zc, button')) return;
    const S = w._g2, G = S && S.geo, box = w.querySelector('.g2-plot'); if (!G || !box) return; const r = box.getBoundingClientRect(), t = G.a + (e.clientX - r.left - G.L) / (G.W - G.L - G.R) * (G.b - G.a);
    if (t >= 0 && t <= 720) e.stopPropagation(); }, true);
  if (window.WGX_NO12) new MutationObserver(() => document.querySelectorAll('.g2').forEach(g => { const S = g.parentElement && g.parentElement._g2, o = S && S.o; if (!o) return;
    const past = o.state !== 'pre' && (o.t == null || o.t > 720); if (g.parentElement.classList.contains('wgx-p12') !== past) g.parentElement.classList.toggle('wgx-p12', past); })).observe(H, { childList: true, subtree: true });
})();
