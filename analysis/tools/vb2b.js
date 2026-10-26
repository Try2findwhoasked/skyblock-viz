/* 04 共现热力图（精简版） */
window.__SB_APP_2b = function () {
  var D = window.__SB_DATA, O = D.topicOrder, CO = D.cooccur
  var $ = function (id) { return document.getElementById(id) }
  var esc = window.__esc
  var n = O.length, cell = 46, lbl = 92, pad = 16
  var W = lbl + n * cell + pad, H = lbl + n * cell + pad
  var mx = 0
  for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
    if (i !== j && CO[O[i].id][O[j].id] > mx) mx = CO[O[i].id][O[j].id]
  }
  var g = '', a, b, v, x, y, fill, diag, tx, ty
  for (var r = 0; r < n; r++) {
    a = O[r]
    for (var cc = 0; cc < n; cc++) {
      b = O[cc]
      diag = r === cc
      v = diag ? 0 : CO[a.id][b.id]
      x = lbl + cc * cell
      y = pad + r * cell
      fill = diag ? '#151b24' : 'rgba(77,159,255,' + (0.05 + (v / mx) * 0.93).toFixed(3) + ')'
      g += '<rect x="' + x + '" y="' + y + '" width="' + (cell - 3) + '" height="' + (cell - 3) +
        '" rx="4" fill="' + fill + '" class="bar"><title>' + esc(a.name) + ' → ' + esc(b.name) +
        (diag ? '' : '：' + Math.round(v * 100) + '%') + '</title></rect>'
      if (!diag && v >= mx * 0.42) {
        g += '<text x="' + (x + cell / 2 - 1.5) + '" y="' + (y + cell / 2 + 2.5) +
          '" text-anchor="middle" style="fill:#0d1117;font-weight:700;font-size:10.5px">' +
          Math.round(v * 100) + '</text>'
      }
    }
  }
  for (var k = 0; k < n; k++) {
    g += '<text x="' + (lbl - 10) + '" y="' + (pad + k * cell + cell / 2 + 4) +
      '" text-anchor="end" style="font-size:11.5px">' + esc(O[k].name) + '</text>'
    tx = lbl + k * cell + cell / 2 - 1.5
    ty = lbl - 14
    g += '<text x="' + tx + '" y="' + ty + '" text-anchor="end" transform="rotate(-52,' +
      tx + ',' + ty + ')" style="font-size:11px">' + esc(O[k].name) + '</text>'
  }
  $('cooccur').innerHTML = '<div style="overflow-x:auto"><svg class="chart" viewBox="0 0 ' + W +
    ' ' + H + '" style="min-width:580px">' + g + '</svg></div>'

  var best = { v: 0, a: '', b: '' }, worst = { v: 2, a: '', b: '' }
  for (var p = 0; p < n; p++) for (var q = 0; q < n; q++) {
    if (p === q) continue
    var w = CO[O[p].id][O[q].id]
    if (w > best.v) best = { v: w, a: O[p].name, b: O[q].name }
    if (w < worst.v) worst = { v: w, a: O[p].name, b: O[q].name }
  }
  var gmr = (CO['grind'] || {})['market'] || 0
  var box = function (cls, t1, t2) {
    return '<div class="ins ' + cls + '"><b>' + esc(t1) + '</b><span>' + esc(t2) + '</span></div>'
  }
  $('coInsight').innerHTML =
    box('good', '最强共现：' + best.a + ' 与 ' + best.b,
      '达 ' + Math.round(best.v * 100) + '%。两类话题几乎总是一起出现，在圈内属于同一个语义单元。') +
    box('warn', '最弱共现：' + worst.a + ' 与 ' + worst.b,
      '仅 ' + Math.round(worst.v * 100) + '%，几乎是互斥的两个讨论场。') +
    box('', '怎么读这张表',
      '行是条件，列是结果。谈到行主题的消息里，有这么多同时谈到列主题。例如刷取效率 → 经济交易为 ' +
      Math.round(gmr * 100) + '%。')
}