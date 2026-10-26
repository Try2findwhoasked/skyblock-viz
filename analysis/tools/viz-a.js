/* SkyBlock 话题可视化渲染（第 1 段：工具 / KPI / 主题 / 形态） */
window.__SB_APP_1 = function () {
  'use strict'
  const D = window.__SB_DATA__, S = D.summary, T = D.topics, ORDER = D.topicOrder
  const LEVELS = ['CORE', 'MAJOR', 'RELATED']
  const $ = id => document.getElementById(id)
  const fmt = n => n.toLocaleString('en-US')
  const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0)
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[c]))
  const dstr = ts => {
    const d = new Date(ts * 1000)
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0')
  }
  const ins = (kind, title, body) =>
    '<div class="ins ' + kind + '"><b>' + title + '</b><span>' + body + '</span></div>'

  /* ---------- 顶部 ---------- */
  $('subline').innerHTML =
    '覆盖 <b>' + S.groupsWithMsgs + '</b> 个群 · 抓取 <b>' + fmt(S.msgs) + '</b> 条精华 · ' +
    '含正文或 OCR <b>' + fmt(S.textMsgs) + '</b> 条（' + pct(S.textMsgs, S.msgs) + '%）· 跨度 <b>' +
    dstr(S.firstTS) + '</b> ~ <b>' + dstr(S.lastTS) + '</b>'
  $('genAt').textContent = '生成于 ' + new Date(D.generatedAt).toLocaleString('zh-CN')

  const top6 = T.slice(0, 6).reduce((a, t) => a + t.primary, 0)
  $('kpis').innerHTML = [
    [fmt(S.msgs), '条', '精华消息'],
    [fmt(S.groupsWithMsgs), '个', '覆盖群聊'],
    [pct(S.imgOnlyMsgs, S.msgs) + '%', '', '无可识别文本占比'],
    [fmt(S.textMsgs), '条', '含正文或 OCR 精华'],
    [(S.chars / 10000).toFixed(1), '万字', '正文＋OCR 字数'],
    [pct(top6, S.textMsgs) + '%', '', 'Top6 主题覆盖率'],
  ].map(k => '<div class="kpi"><div class="v">' + k[0] +
    (k[1] ? '<small>' + k[1] + '</small>' : '') + '</div><div class="l">' + k[2] + '</div></div>'
  ).join('')

  /* ---------- 01 主题 ---------- */
  const maxMention = Math.max.apply(null, T.map(t => t.mention))
  let active = T[0] ? T[0].id : null

  function renderBars() {
    $('topicBars').innerHTML = T.map((t, i) => {
      const w = (t.mention / maxMention) * 100
      return '<div class="trow' + (t.id === active ? ' on' : '') + '" data-id="' + t.id + '">' +
        '<div class="rank">' + (i + 1) + '</div><div class="meter">' +
        '<div class="fill" style="width:' + w.toFixed(1) + '%;background:' + t.color + '"></div>' +
        '<div class="txt"><span class="nm">' + esc(t.name) + '<em>' + pct(t.mention, S.textMsgs) +
        '%</em></span><span class="n">' + fmt(t.mention) + ' 条</span></div></div></div>'
    }).join('')
    Array.prototype.forEach.call($('topicBars').querySelectorAll('.trow'), el => {
      el.addEventListener('click', () => {
        active = el.dataset.id
        renderBars(); renderDetail()
      })
    })
  }

  function renderDetail() {
    const t = T.find(x => x.id === active)
    if (!t) { $('topicDetail').innerHTML = '<div class="empty">—</div>'; return }
    const kw = t.kw.length
      ? t.kw.map(k => '<span class="chip">' + esc(k.k) + '<b>' + k.n + '</b></span>').join('')
      : '<span class="empty">无显著关键词</span>'
    const cell = (l, v) => '<div><div style="color:var(--fg3);font-size:11.5px">' + l +
      '</div><div style="font-size:16px;font-weight:600;font-variant-numeric:tabular-nums">' + v + '</div></div>'
    $('topicDetail').innerHTML =
      '<h3><span class="dot" style="background:' + t.color + '"></span>' + esc(t.name) + '</h3>' +
      '<div class="dd">' + esc(t.desc) + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
      cell('提及消息', fmt(t.mention) + ' 条') +
      cell('占有文本精华', pct(t.mention, S.textMsgs) + '%') +
      cell('作为主标签', fmt(t.primary) + ' 条') +
      cell('关键词命中', fmt(t.kwHits) + ' 次') + '</div>' +
      '<div style="color:var(--fg3);font-size:12px;margin-top:20px;letter-spacing:.05em">高频实体</div>' +
      '<div class="chips">' + kw + '</div>' +
      '<button class="more" data-goto-topic="' + t.id + '">查看该话题的原始精华消息 ↓</button>'
  }

  renderBars(); renderDetail()

  /* ---------- 02 形态 ---------- */
  function arcPath(cx, cy, R, r, a1, a2) {
    const large = a2 - a1 > Math.PI ? 1 : 0
    const p = (rad, a) => [(cx + rad * Math.cos(a)).toFixed(2), (cy + rad * Math.sin(a)).toFixed(2)]
    const A = p(R, a1), B = p(R, a2), C = p(r, a2), E = p(r, a1)
    return 'M' + A + ' A' + R + ' ' + R + ' 0 ' + large + ' 1 ' + B +
      ' L' + C + ' A' + r + ' ' + r + ' 0 ' + large + ' 0 ' + E + ' Z'
  }

  function donut() {
    const imgOnly = S.imgOnlyMsgs
    const mixed = Math.max(0, S.hasImgMsgs - (S.msgs - S.textMsgs))
    const textOnly = S.textMsgs - mixed
    const items = [
      { l: '纯图片 / 文件（无文本）', v: imgOnly, c: '#9334e6' },
      { l: '文本 + 图片混合', v: mixed, c: '#3fb950' },
      { l: '纯文本', v: textOnly, c: '#4d9fff' },
    ].filter(x => x.v > 0)
    const total = items.reduce((a, x) => a + x.v, 0)

    const cx = 110, cy = 110
    let ang = -Math.PI / 2
    const paths = items.map(it => {
      const a2 = ang + (it.v / total) * Math.PI * 2
      const d = arcPath(cx, cy, 80, 52, ang, a2)
      ang = a2
      return '<path d="' + d + '" fill="' + it.c + '" opacity=".86" class="bar"><title>' +
        it.l + '：' + it.v + '（' + pct(it.v, total) + '%）</title></path>'
    }).join('')

    $('donut').innerHTML =
      '<svg class="chart" viewBox="0 0 220 220" style="max-width:270px;margin:0 auto">' + paths +
      '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" ' +
      'style="fill:var(--fg);font-size:23px;font-weight:700">' + pct(imgOnly, S.msgs) + '%</text>' +
      '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" style="font-size:11px">纯图片占比</text>' +
      '</svg>' +
      '<div style="margin-top:10px">' + items.map(it =>
        '<div style="display:flex;align-items:center;gap:9px;margin:9px 0;font-size:13px">' +
        '<i style="width:10px;height:10px;border-radius:3px;background:' + it.c + ';flex:none"></i>' +
        '<span style="flex:1">' + it.l + '</span>' +
        '<b style="font-variant-numeric:tabular-nums">' + fmt(it.v) + '</b>' +
        '<span style="color:var(--fg3);width:54px;text-align:right">' + pct(it.v, total) + '%</span></div>'
      ).join('') + '</div>'

    $('formInsight').innerHTML = [
      ins('bad', '精华区 = 半个图床',
        pct(imgOnly, S.msgs) + '% 的精华是纯图片或文件，知识以截图形式保存。'),
      ins('warn', '变成图片就不可检索',
        '这是中文 SkyBlock 知识库难以沉淀的结构性原因：配装、掉落、收益全靠截图。'),
      ins('good', '文本只是索引层',
        '含文本的 ' + fmt(S.textMsgs) + ' 条精华里单条信息量普遍偏低，价值靠量累积。'),
    ].join('')
  }

  donut()
}