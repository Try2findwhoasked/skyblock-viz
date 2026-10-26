/* SkyBlock 话题可视化渲染（第 4 段：原始语料查看 / 群样例 / 灯箱 / 图片进度） */
window.__SB_APP_4 = function () {
  'use strict'
  var D = window.__SB_DATA__
  var $ = function (id) { return document.getElementById(id) }
  var esc = window.__esc
  var IMG_BASE = '../images/'

  function pad(n) { return n < 10 ? '0' + n : '' + n }
  function fmtTs(ts) {
    if (!ts) return '时间未知'
    var d = new Date(ts * 1000)
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
  }
  function renderText(t) {
    var s = esc(t)
    return s.replace(/(https?:\/\/[^\s]+)/g, '<span class="url">$1</span>')
  }
  function imgSrc(it) {
    if (it && it.local) return IMG_BASE + it.local
    return ''
  }
  function imgFull(it) {
    if (it && it.local) return IMG_BASE + it.local
    return (it && it.url) || ''
  }

  function msgCard(m, showGroup) {
    var h = '<div class="msg"><div class="mh">'
    h += '<span class="nk">' + esc(m.nick || '匿名') + '</span>'
    if (showGroup && m.gname) {
      h += '<a class="gn" href="#" data-gid="' + esc(String(m.gid)) + '">' + esc(m.gname) + '</a>'
    }
    h += '<span class="sp"></span>'
    h += '<span>' + fmtTs(m.ts) + '</span>'
    if (m.op && m.op !== m.nick) h += '<span class="tag">' + esc(m.op) + ' 加精</span>'
    h += '</div>'
    if (m.text) h += '<div class="mt">' + renderText(m.text) + '</div>'
    if (m.ocr) h += '<details class="mt"><summary>图片 OCR 文字（自动识别）</summary>' + renderText(m.ocr) + '</details>'

    var imgs = m.images || []
    if (imgs.length) {
      var cached = 0
      h += '<div class="thumbs">'
      for (var i = 0; i < imgs.length; i++) {
        var src = imgSrc(imgs[i])
        if (src) {
          cached++
          h += '<img loading="lazy" src="' + esc(src) + '" data-full="' + esc(src) + '" alt="">'
        } else {
          var u = (imgs[i] && imgs[i].url) || ''
          if (u) {
            h += '<a class="ph" href="' + esc(u) + '" target="_blank" rel="noopener"' +
              ' style="cursor:pointer;text-decoration:none">未缓存<br>查看原图</a>'
          } else {
            h += '<div class="ph">图片缺失</div>'
          }
        }
      }
      h += '</div>'
      if (cached === 0 && imgs.length > 1) {
        h = h.replace('<div class="thumbs">',
          '<div class="thumbs" data-uncached="' + imgs.length + '">')
      }
    }
    if (m.others && m.others.length) {
      h += '<div class="thumbs" style="margin-top:7px">'
      for (var j = 0; j < m.others.length; j++) {
        h += '<span class="tag">文件 ' + esc(m.others[j].name || '') + '</span>'
      }
      h += '</div>'
    }
    h += '</div>'
    return h
  }

  /* ---------- 灯箱 ---------- */
  var LB = $('lightbox')
  if (LB && !LB.getAttribute('data-bound')) {
    LB.setAttribute('data-bound', '1')
    LB.addEventListener('click', function () { LB.classList.remove('on') })
  }
  document.addEventListener('click', function (e) {
    var t = e.target
    if (t && t.tagName === 'IMG' && LB && t.getAttribute('data-full')) {
      LB.querySelector('img').src = t.getAttribute('data-full')
      LB.classList.add('on')
    }
  })

  /* ---------- 09 话题样例 ---------- */
  var CHIPS = $('topicChips')
  var BOX = $('topicSamples')
  var curTopic = ''

  function listOf(tid) {
    if (tid === 'other') return D.samplesOther || []
    return (D.samples && D.samples[tid]) || []
  }
  function renderTopic(tid) {
    if (!BOX) return
    var arr = listOf(tid)
    if (!arr.length) {
      BOX.innerHTML = '<div class="empty">该话题暂无可用样例</div>'
      return
    }
    var h = ''
    for (var i = 0; i < arr.length; i++) h += msgCard(arr[i], true)
    BOX.innerHTML = h
  }
  function chipHtml() {
    if (!CHIPS) return
    var order = (D.topicOrder || []).slice()
    var h = ''
    for (var i = 0; i < order.length; i++) {
      var it = order[i]
      h += '<span class="tchip' + (it.id === curTopic ? ' on' : '') + '" data-tid="' + esc(it.id) + '">' +
        '<i style="background:' + esc(it.color) + '"></i>' + esc(it.name) +
        '<em>' + listOf(it.id).length + '</em></span>'
    }
    h += '<span class="tchip' + (curTopic === 'other' ? ' on' : '') + '" data-tid="other">' +
      '<i style="background:#8b949e"></i>其他 / 未归类<em>' + listOf('other').length + '</em></span>'
    CHIPS.innerHTML = h
  }
  if (CHIPS) {
    CHIPS.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('.tchip') : null
      if (!el) return
      curTopic = el.getAttribute('data-tid')
      chipHtml()
      renderTopic(curTopic)
    })
  }
  if (BOX) {
    var t0 = (D.topics && D.topics[0] && D.topics[0].id) || ((D.topicOrder || [])[0] || {}).id || 'other'
    curTopic = listOf(t0).length ? t0 : 'other'
    chipHtml()
    renderTopic(curTopic)
  }

  /* ---------- 08 群样例侧栏 ---------- */
  var GBOX = $('groupSamples')
  var G_PAGE = 30           // 首次渲染条数
  var gState = { gid: null, shown: 0 }

  function renderGroup(gid, keepScroll) {
    if (!GBOX) return
    var g = null
    var gs = D.groups || []
    for (var i = 0; i < gs.length; i++) {
      if (String(gs[i].gid) === String(gid)) { g = gs[i]; break }
    }
    var arr = (D.groupSamples && D.groupSamples[gid]) || []
    var head = '<h3>' + esc(g ? g.name : gid) + '</h3>'
    if (g) {
      head += '<div class="gd"><span class="lv ' + esc(g.level) + '">' + esc(g.level) + '</span>' +
        ' · 纯度 ' + g.purity + '% · 精华 ' + g.nMsgs + ' 条 · 群规模 ' + g.size + ' 人</div>'
    }
    if (!arr.length) {
      var why = '该群精华区为空，没有可展示的消息'
      if (g && g.error) why = '机器人不在该群内，无权限读取精华消息'
      else if (g && g.nMsgs > 0) why = '该群精华均为图片/文件，且尚未缓存'
      GBOX.innerHTML = head + '<div class="empty">' + why + '</div>'
      gState = { gid: String(gid), shown: 0 }
      return
    }

    if (String(gid) !== gState.gid) gState = { gid: String(gid), shown: G_PAGE }
    else if (!keepScroll) gState.shown = G_PAGE

    var n = Math.min(gState.shown, arr.length)
    var body = ''
    for (var k = 0; k < n; k++) body += msgCard(arr[k], false)

    var foot = ''
    if (n < arr.length) {
      foot = '<button class="more" id="gMore">加载更多（已显示 ' + n + ' / ' + arr.length + ' 条）</button>'
    } else if (arr.length > G_PAGE) {
      foot = '<div class="empty" style="padding:12px 0">已显示全部 ' + arr.length + ' 条精华</div>'
    }
    GBOX.innerHTML = head +
      '<div class="gd" style="margin-bottom:10px">共 <b style="color:var(--accent)">' +
      arr.length + '</b> 条可展示消息</div>' +
      '<div class="msgs" id="gMsgs" style="max-height:640px">' + body + '</div>' + foot

    var more = $('gMore')
    if (more) {
      more.addEventListener('click', function () {
        gState.shown += 60
        renderGroup(gid, true)
        var box = $('gMsgs')
        if (box) box.scrollTop = box.scrollHeight
      })
    }
  }

  var GT = $('groupTable')
  if (GT) {
    GT.addEventListener('click', function (e) {
      var tr = e.target.closest ? e.target.closest('tr') : null
      if (!tr) return
      var tb = tr.parentNode
      if (!tb || tb.tagName !== 'TBODY') return
      var idx = Array.prototype.indexOf.call(tb.children, tr)
      var g = (D.groups || [])[idx]
      if (!g) return
      for (var i = 0; i < tb.children.length; i++) tb.children[i].classList.remove('sel')
      tr.classList.add('sel')
      renderGroup(g.gid)
    })
    var g0 = (D.groups || [])[0]
    if (g0) {
      renderGroup(g0.gid)
      var tb0 = GT.querySelector('tbody')
      if (tb0 && tb0.children[0]) tb0.children[0].classList.add('sel')
    }
  }

  /* 消息里的群名链接 → 跳到 08 群样例 */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('.msg .gn') : null
    if (!a) return
    e.preventDefault()
    var gid = a.getAttribute('data-gid')
    var gs = D.groups || []
    var idx = -1
    for (var i = 0; i < gs.length; i++) {
      if (String(gs[i].gid) === String(gid)) { idx = i; break }
    }
    var tb = GT && GT.querySelector('tbody')
    if (tb && idx >= 0) {
      for (var k = 0; k < tb.children.length; k++) tb.children[k].classList.remove('sel')
      tb.children[idx].classList.add('sel')
      if (tb.children[idx].scrollIntoView) tb.children[idx].scrollIntoView({ block: 'center' })
    }
    renderGroup(gid)
  })

  /* 01 话题详情 → 09 原始语料 联动 */
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-goto-topic]') : null
    if (!b) return
    e.preventDefault()
    var tid = b.getAttribute('data-goto-topic')
    curTopic = tid
    chipHtml()
    renderTopic(tid)
    var sec = BOX && BOX.parentNode
    while (sec && sec.tagName !== 'SECTION') sec = sec.parentNode
    if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (BOX) BOX.scrollTop = 0
  })

  /* ---------- 图片缓存进度 ---------- */
  var st = D.imageStats || { total: 0, downloaded: 0 }
  var sub = $('subline')
  if (sub && st.total) {
    var p = Math.round((st.downloaded / st.total) * 1000) / 10
    sub.innerHTML = sub.innerHTML + ' · <span class="progress">图片缓存 ' +
      st.downloaded + '/' + st.total +
      '<span class="bar"><i style="width:' + p + '%"></i></span></span>'
  }
}