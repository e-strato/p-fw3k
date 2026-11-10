// gs-upgrade · данные для доработок страницы матча (_upm.js).
// UPM_ICONS — какие иконки предметов уже лежат в репо (gs-match/img/items); нет иконки — предмет буквой.
// UPM_BLD — где стоят здания на подложке мини-карты w-lanemap/map.png (доли 0–1, x — вправо, y — вниз), сторона Radiant;
//   у Dire — те же точки, отражённые через центр карты (линии top ↔ bot меняются местами). Расстановка — на глаз по подложке.
window.UPM_ICONS = new Set(['gem', 'abyssal_blade', 'aegis', 'aeon_disk', 'aether_lens', 'ancient_janggo', 'arcane_blink', 'arcane_boots', 'armlet', 'assault', 'basher', 'bfury', 'black_king_bar', 'blade_mail', 'blink', 'blood_grenade', 'bloodstone', 'bloodthorn', 'boots', 'bottle', 'bracer', 'butterfly', 'chasm_stone', 'circlet', 'clarity', 'cloak', 'cloak_of_flames', 'conjurers_catalyst', 'consecrated_wraps', 'crellas_crozier', 'cyclone', 'dagon_5', 'defiant_shell', 'demonicon', 'desolator', 'devastator', 'disperser', 'dust', 'echo_sabre', 'enchanters_bauble', 'essence_distiller', 'essence_ring', 'falcon_blade', 'fallen_sky', 'famango', 'flayers_bota', 'force_staff', 'ghost', 'giant_maul', 'glimmer_cape', 'greater_crit', 'greater_famango', 'guardian_greaves', 'gungir', 'gunpowder_gauntlets', 'hand_of_midas', 'harpoon', 'heart', 'helm_of_the_dominator', 'holy_locket', 'hurricane_pike', 'hydras_breath', 'idol_of_screeauk', 'infused_raindrop', 'invis_sword', 'jidi_pollen_bag', 'kaya', 'kaya_and_sange', 'lesser_crit', 'lifesteal', 'lotus_orb', 'mage_slayer', 'magic_stick', 'magic_wand', 'mana_draught', 'manta', 'mask_of_madness', 'medallion_of_courage', 'mekansm', 'metamorphic_mandible', 'meteor_hammer', 'minotaur_horn', 'mjollnir', 'monkey_king_bar', 'null_talisman', 'nullifier', 'octarine_core', 'overwhelming_blink', 'partisans_brand', 'phase_boots', 'pipe', 'pogo_stick', 'point_booster', 'power_treads', 'prophets_pendulum', 'psychic_headband', 'quelling_blade', 'radiance', 'rapier', 'rattlecage', 'refresher', 'refresher_shard', 'ring_of_basilius', 'sange_and_yasha', 'satanic', 'serrated_shiv', 'shawl', 'sheepstick', 'shivas_guard', 'silver_edge', 'skadi', 'solar_crest', 'soul_ring', 'spellslinger', 'sphere', 'spirit_vessel', 'swift_blink', 'tranquil_boots', 'travel_boots', 'travel_boots_2', 'ultimate_scepter', 'vladmir', 'ward_dispenser', 'ward_observer', 'ward_sentry', 'wind_lace', 'wind_waker', 'witch_blade', 'yasha_and_kaya']);
window.UPM_SKIP = new Set(['dust', 'ward_sentry', 'ward_observer', 'ward_dispenser', 'clarity', 'tango', 'flask', 'tpscroll', 'smoke_of_deceit', 'enchanted_mango', 'famango', 'greater_famango', 'faerie_fire', 'blood_grenade', 'branches', 'aegis', 'cheese', 'refresher_shard']);
window.UPM_BLD = {
  tower1_top: [.08, .38], tower2_top: [.08, .55], tower3_top: [.08, .70],
  tower1_mid: [.40, .60], tower2_mid: [.31, .67], tower3_mid: [.22, .75],
  tower1_bot: [.78, .92], tower2_bot: [.50, .92], tower3_bot: [.29, .92],
  tower4a: [.15, .78], tower4b: [.18, .81],
  melee_rax_top: [.06, .75], range_rax_top: [.10, .75],
  melee_rax_mid: [.19, .76], range_rax_mid: [.21, .79],
  melee_rax_bot: [.25, .90], range_rax_bot: [.25, .94],
  fort: [.12, .86],
};
