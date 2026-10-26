/* 03 月度趋势 */
window.__SB_APP_2a = function () {
  'use strict'
  var D = window.__SB_DATA, T = D.topics, ORDER = D.topicOrder, M = D.monthly
  var $ = function (id) { return document.getElementById(id) }
  var esc = window.__esc
  var nameOf = function (id) {
    for (var i = 0; i < ORDER.length; i++) if (ORDER[i].id === id) return ORDER[i].name
    return id
  }
  var colorOf = function (id) {
    for (var i = 0; i < ORDER.length; i++) if (ORDER[i].id === id) return ORDER[i].color
    return '#8b949e'
  }

  var W = 1040, H = 400, PL = 54, PR = 22, PT = 26, PB = 48
  var iw = W - PL - PR, ih = H - PT - PB
  var topIds = T.slice(0, 6).map(function (t) { return t.id })
  var mx = 0
  M.forEach(function (m) { if (m.n > mx) mx = m.n })
  var yMax = Math.max(50, Math.ceil(mx / 50) * 50)
  var xs = function (i) { return PL + (M.length <= 1 ? iw / 2 : (i / (M.length - 1)) * iw) }
  var ys = function (v) { return PT + ih - (v / yMax) * ih }

  var g = ''
  for (var k = 0; k <= 4; k++) {
    var v = (yMax / 4) * k, y = ys(v)
    g += '<line class="grid-l" x1="' + PL + '" y1="' + y + '" x2="' + (W - PR) + '" y2="' + y + '"/>'
    g += '<text x="' + (PL - 9) + '" y="' + (y + 4) + '" text-anchor="end">' + v + '</text>'
  }
  g += '<line class="axis" x1="' + PL + '" y1="' + (PT + ih) + '" x2="' + (W - PR) +
    '" y2="' + (PT + ih) + '"/>'

  var stack = M.map(function () { return 0 })
  topIds.forEach(function (id) {
    var vals = M.map(function (m) { return m.topics[id] || 0 })
    var base = stack.slice()
    stack = stack.map(function (s, i) { return s + vals[i] })
    var up = '', dn = ''
    for (var i = 0; i < M.length; i++) up += (i ? 'L' : 'M') + xs(i).toFixed(1) + ' ' + ys(stack[i]).toFixed(1)
    for (var j = M.length - 1; j >= 0; j--) dn += 'L' + xs(j).toFixed(1) + ' ' + ys(base[j]).toFixed(1)
    g += '<path d="' + up + dn + 'Z" fill="' + colorOf(id) + '" opacity=".28" class="bar">' +
      '<title>' + esc(nameOf(id)) + '</title></path>'
  })

  var ln = ''
  M.forEach(function (m, i) { ln += (i ? 'L' : 'M') + xs(i).toFixed(1) + ' ' + ys(m.n).toFixed(1) })
  g += '<path d="' + ln + '" fill="none" stroke="#e6edf3" stroke-width="2" stroke-linejoin="round"/>'

  var step = Math.max(1, Math.ceil(M.length / 12))
  for (var i2 = 0; i2 < M.length; i2 += step) {
    g += '<text x="' + xs(i2).toFixed(1) + '" y="' + (H - 22) + '" text-anchor="middle">' + M[i2].key + '</text>'
  }

  var pi = 0
  M.forEach(function (m, i) { if (m.n > M[pi].n) pi = i })
  g += '<circle cx="' + xs(pi).toFixed(1) + '" cy="' + ys(M[pi].n).toFixed(1) + '" r="4.5" fill="#f0883e"/>'
  g += '<text x="' + xs(pi).toFixed(1) + '" y="' + (ys(M[pi].n) - 13) +
    '" text-anchor="middle" style="fill:#f0883e;font-weight:600">峰值 ' + M[pi].key + ' · ' + M[pi].n + '</text>'

  $('monthlyChart').innerHTML = '<div style="overflow-x:auto"><svg class="chart" viewBox="0 0 ' + W + ' ' +
    H + '" style="min-width:660px">' + g + '</svg></div>'

  $('monthLegend').innerHTML = topIds.map(function (id) {
    return '<span><i style="background:' + colorOf(id) + ';opacity:.65"></i>' + esc(nameOf(id)) + '</span>'
  }).join('') + '<span><i style="background:#e6edf3"></i>月度总量</span>'
}