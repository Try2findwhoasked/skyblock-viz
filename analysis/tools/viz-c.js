/* SkyBlock 话题可视化渲染（第 3 段：高频词 / 散点 / 群明细） */
window.__SB_APP_3 = function () {
  'use strict'
  const D = window.__SB_DATA__, S = D.summary
  const LEVELS = ['CORE', 'MAJOR', 'RELATED']
  const $ = id => document.getElementById(id)
  const fmt = n => n.toLocaleString('en-US')
  const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0)
  const esc = window.__esc

  /* ---------- 06 领域词 ---------- */
  function terms() {
    const list = D.terms.slice(0, 26)
    const W = 640, rowH = 27, P = { l: 132, r: 56, t: 6, b: 6 }
    const iw = W - P.l - P.r
    const mx = Math.max.apply(null, list.map(t => t.df))
    const H = P.t + P.b + list.length * rowH

    let g = ''
    list.forEach((t, i) => {
      const y = P.t + i * rowH
      const w = (t.df / mx) * iw
      const col = t.color || '#8b949e'
      g += '<text x="' + (P.l - 11) + '" y="' + (y + 17) + '" text-anchor="end" ' +
        'style="fill:var(--fg);font-size:12.5px">' + esc(t.term) + '</text>' +
        '<rect x="' + P.l + '" y="' + (y + 6) + '" width="' + w.toFixed(1) + '" height="15" rx="4" ' +
        'fill="' + col + '" opacity=".78" class="bar"><title>' + esc(t.term) + '（' +
        esc(t.catName) + '）：' + t.df + ' 条精华 / ' + t.hits + ' 次命中（同条重复只计 1 条）' +
        '</title></rect>' +
        '<text x="' + (P.l + w + 8) + '" y="' + (y + 18) + '" style="font-size:11.5px">' + t.df + '</text>'
    })

    const cats = D.termCats || []
    const legend = cats.map(c =>
      '<span><i style="background:' + c.color + '"></i>' + esc(c.name) +
      '<span style="color:var(--fg3);margin-left:5px">' + c.n + '</span></span>'
    ).join('')

    $('terms').innerHTML = '<div style="overflow-x:auto"><svg class="chart" viewBox="0 0 ' + W + ' ' +
      H + '" style="min-width:520px">' + g + '</svg></div>' +
      '<div class="legend">' + legend + '</div>'

    const topicName = {}
    ;(D.topicOrder || []).forEach(t => { topicName[t.id] = t.name })
    topicName.other = '未归类'

    $('termTable').innerHTML =
      '<thead><tr><th>#</th><th>领域词</th><th>类别</th><th>主语境</th>' +
      '<th class="num">精华数</th><th class="num">命中次数</th></tr></thead><tbody>' +
      D.terms.map((t, i) =>
        '<tr><td class="num">' + (i + 1) + '</td><td><b>' + esc(t.term) + '</b></td>' +
        '<td><span style="font-size:11px;padding:2px 7px;border-radius:5px;' +
        'background:' + t.color + '22;color:' + t.color + ';font-weight:600">' +
        esc(t.catName) + '</span></td>' +
        '<td style="color:var(--fg3);font-size:12px">' + esc(topicName[t.topTopic] || t.topTopic) +
        ' <span style="color:var(--fg3)">' + Math.round(t.topShare * 100) + '%</span></td>' +
        '<td class="num">' + t.df + '</td>' +
        '<td class="num" style="color:var(--fg3)">' + t.hits + '</td></tr>'
      ).join('') + '</tbody>'
  }

  terms()

  /* ---------- 07 群散点 ---------- */
  function scatter() {
    const W = 1040, H = 430, P = { l: 60, r: 26, t: 22, b: 54 }
    const iw = W - P.l - P.r, ih = H - P.t - P.b
    const gs = D.groups.filter(g => g.nMsgs > 0 && g.chars > 0)
    const maxChars = Math.max.apply(null, gs.map(g => g.chars))
    const maxMsgs = Math.max.apply(null, gs.map(g => g.nMsgs))
    const logMax = Math.log10(Math.max(10, maxChars))

    const xs = v => P.l + (Math.log10(Math.max(10, v)) / logMax) * iw
    const ys = v => P.t + ih - (v / maxMsgs) * ih
    const col = { CORE: '#3fb950', MAJOR: '#4d9fff', RELATED: '#f0883e' }

    let g = ''
    for (let k = 0; k <= 4; k++) {
      const y = P.t + (ih / 4) * k
      const v = Math.round((maxMsgs / 4) * (4 - k))
      g += '<line class="grid-l" x1="' + P.l + '" y1="' + y + '" x2="' + (W - P.r) + '" y2="' + y + '"/>' +
        '<text x="' + (P.l - 9) + '" y="' + (y + 4) + '" text-anchor="end">' + v + '</text>'
    }
    g += '<line class="axis" x1="' + P.l + '" y1="' + (P.t + ih) + '" x2="' + (W - P.r) +
      '" y2="' + (P.t + ih) + '"/>'

    gs.forEach(gr => {
      const r = 3 + Math.sqrt(gr.nSender) * 0.85
      g += '<circle cx="' + xs(gr.chars).toFixed(1) + '" cy="' + ys(gr.nMsgs).toFixed(1) +
        '" r="' + Math.min(16, r).toFixed(1) + '" fill="' + (col[gr.level] || '#8b949e') +
        '" opacity=".55" class="bar"><title>' + esc(gr.name) + '\n' +
        '精华 ' + gr.nMsgs + ' 条 · 文本 ' + fmt(gr.chars) + ' 字 · ' + gr.nSender + ' 人\n' +
        gr.level + ' · 纯度 ' + gr.purity + '%</title></circle>'
    })

    ;[100, 1000, 10000, 100000, 1000000].forEach(v => {
      if (v > maxChars * 1.2) return
      g += '<text x="' + xs(v).toFixed(1) + '" y="' + (H - 30) + '" text-anchor="middle">' +
        (v >= 10000 ? v / 10000 + '万' : v) + '</text>'
    })
    g += '<text x="' + (P.l + iw / 2) + '" y="' + (H - 8) + '" text-anchor="middle" ' +
      'style="font-size:11.5px">群内精华文本总字数（对数刻度）</text>'
    g += '<text x="15" y="' + (P.t + ih / 2) + '" text-anchor="middle" transform="rotate(-90,15,' +
      (P.t + ih / 2) + ')" style="font-size:11.5px">精华条数</text>'

    $('scatter').innerHTML = '<div style="overflow-x:auto"><svg class="chart" viewBox="0 0 ' + W + ' ' +
      H + '" style="min-width:660px">' + g + '</svg></div>' +
      '<div class="legend">' + LEVELS.map(l =>
        '<span><i style="background:' + col[l] + '"></i>' + l + '</span>'
      ).join('') + '<span style="color:var(--fg3)">圆圈大小 = 群内发过精华的人数</span></div>'
  }

  scatter()

  /* ---------- 08 群明细 ---------- */
  function groupTable() {
    const rows = D.groups
    $('groupTable').innerHTML =
      '<thead><tr><th>#</th><th>群名</th><th>圈层</th><th class="num">精华</th>' +
      '<th class="num">含文本</th><th class="num">字数</th><th class="num">人数</th>' +
      '<th class="num">跨度</th></tr></thead><tbody>' +
      rows.map((g, i) =>
        '<tr><td class="num">' + (i + 1) + '</td><td>' + esc(g.name) +
        (g.error ? ' <span style="color:#f85149;font-size:11px">· 无权限</span>' : '') + '</td>' +
        '<td><span class="lv ' + g.level + '">' + g.level + '</span></td>' +
        '<td class="num">' + g.nMsgs + '</td><td class="num">' + g.nTxt + '</td>' +
        '<td class="num">' + fmt(g.chars) + '</td><td class="num">' + g.nSender + '</td>' +
        '<td class="num">' + (g.spanDays ? g.spanDays + ' 天' : '—') + '</td></tr>'
      ).join('') + '</tbody>'
  }

  groupTable()
}