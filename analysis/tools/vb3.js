/* 05 圈层构成 */
window.__SB_APP_2c = function () {
  'use strict'
  var D = window.__SB_DATA, ORDER = D.topicOrder
  var LEVELS = ['CORE', 'MAJOR', 'RELATED']
  var $ = function (id) { return document.getElementById(id) }
  var esc = window.__esc
  var pct = function (a, b) { return b ? Math.round((a / b) * 1000) / 10 : 0 }

  var W = 1020, rowH = 66, PL = 100, PR = 26, PT = 14, PB = 20
  var iw = W - PL - PR
  var rows = LEVELS.filter(function (lv) { return D.byLevel[lv] })
  var H = PT + PB + rows.length * rowH

  var g = ''
  rows.forEach(function (lv, i) {
    var m = D.byLevel[lv]
    var total = Object.keys(m).reduce(function (a, k) { return a + m[k] }, 0)
    var y = PT + i * rowH
    var x = PL
    var parts = ORDER.filter(function (o) { return m[o.id] > 0 })
      .sort(function (a, b) { return m[b.id] - m[a.id] })
    parts.forEach(function (o) {
      var v = m[o.id], w = (v / total) * iw
      g += '<rect x="' + x.toFixed(1) + '" y="' + (y + 10) + '" width="' +
        Math.max(0, w - 1.6).toFixed(1) + '" height="32" rx="4" fill="' + o.color +
        '" class="bar"><title>' + esc(o.name) + '：' + v + ' 条（' + pct(v, total) + '%）</title></rect>'
      if (w > 48) {
        g += '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (y + 31) +
          '" text-anchor="middle" style="fill:#0d1117;font-weight:700;font-size:10.5px">' +
          Math.round((v / total) * 100) + '</text>'
      }
      x += w
    })
    g += '<text x="' + (PL - 12) + '" y="' + (y + 26) + '" text-anchor="end" ' +
      'style="fill:var(--fg);font-size:13.5px;font-weight:600">' + lv + '</text>'
    g += '<text x="' + (PL - 12) + '" y="' + (y + 43) + '" text-anchor="end" ' +
      'style="font-size:10.5px">' + total + ' 条</text>'
  })

  $('levelChart').innerHTML = '<div style="overflow-x:auto"><svg class="chart" viewBox="0 0 ' + W + ' ' +
    H + '" style="min-width:620px">' + g + '</svg></div>'

  var core = D.byLevel['CORE'] || {}
  $('levelLegend').innerHTML = ORDER.filter(function (o) { return core[o.id] > 0 })
    .map(function (o) {
      return '<span><i style="background:' + o.color + '"></i>' + esc(o.name) + '</span>'
    }).join('') + '<span style="color:var(--fg3)">数字为层内占比 %</span>'
}