"""Keep the legacy gallery HTML small and load its unchanged data compressed."""
import gzip
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT/'viz-data.json').read_text(encoding='utf-8'))
base = dict(data)
base['groupSamples'] = {}
base['imageMap'] = {}
base['groupSampleFiles'] = {}
base['samples'] = {}
base['samplesOther'] = []
base['sampleFiles'] = {}
base['sampleCounts'] = {}
topics_folder = ROOT/'essence-topics'
topics_folder.mkdir(exist_ok=True)
for tid, rows in dict(data.get('samples', {}), other=data.get('samplesOther', [])).items():
    assert re.fullmatch(r'[a-z0-9_-]+', tid)
    name = tid+'.json.gz'
    payload = json.dumps(rows, ensure_ascii=True, separators=(',', ':')).encode('utf-8')
    (topics_folder/name).write_bytes(gzip.compress(payload, compresslevel=9, mtime=0))
    base['sampleFiles'][tid] = 'essence-topics/'+name
    base['sampleCounts'][tid] = len(rows)
folder = ROOT/'essence-groups'
folder.mkdir(exist_ok=True)
for gid, rows in data.get('groupSamples', {}).items():
    assert re.fullmatch(r'\d+', str(gid))
    name = str(gid)+'.json.gz'
    payload = json.dumps(rows, ensure_ascii=True, separators=(',', ':')).encode('utf-8')
    (folder/name).write_bytes(gzip.compress(payload, compresslevel=9, mtime=0))
    base['groupSampleFiles'][str(gid)] = 'essence-groups/'+name
packed = json.dumps(base, ensure_ascii=True, separators=(',', ':')).encode('utf-8')
(ROOT/'essence-data.json.gz').write_bytes(gzip.compress(packed, compresslevel=9, mtime=0))
p = ROOT/'essence-analysis.html'
html = p.read_text(encoding='utf-8')
html = re.sub(r'^window\.__SB_DATA = .+$', '// Essence data loads asynchronously below.', html, flags=re.M)
if 'LAZY_ESSENCE_TOPICS' not in html:
    original = '  function renderTopic(tid) {\n    if (!BOX) return'
    replacement = '''  /* LAZY_ESSENCE_TOPICS */
  var topicLoadToken = 0
  function renderTopic(tid) {
    if (!BOX) return
    var token = ++topicLoadToken
    if (D.sampleFiles && D.sampleFiles[tid] &&
        !Object.prototype.hasOwnProperty.call(D.samples, tid)) {
      BOX.innerHTML = '<div class="empty">正在读取该话题消息样例…</div>'
      fetch(D.sampleFiles[tid]).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json()
      }).then(function (rows) {
        D.samples[tid] = rows
        if (tid === 'other') D.samplesOther = rows
        if (token === topicLoadToken) renderTopic(tid)
      }).catch(function (e) {
        if (token !== topicLoadToken) return
        BOX.innerHTML = '<div class="empty">话题样例读取失败：' + esc(e.message) + '</div>'
        var retry = document.createElement('button')
        retry.className = 'more'
        retry.textContent = '重新加载样例'
        retry.addEventListener('click', function () { renderTopic(tid) })
        BOX.appendChild(retry)
      })
      return
    }'''
    assert original in html
    html = html.replace(original, replacement, 1)
    html = html.replace("+ listOf(it.id).length +", "+ (D.sampleCounts ? D.sampleCounts[it.id] || 0 : listOf(it.id).length) +")
    html = html.replace("+ listOf('other').length +", "+ (D.sampleCounts ? D.sampleCounts.other || 0 : listOf('other').length) +")
if 'LAZY_ESSENCE_GROUPS' not in html:
    original = '  function renderGroup(gid, keepScroll) {\n    if (!GBOX) return'
    replacement = '''  /* LAZY_ESSENCE_GROUPS */
  var groupLoadToken = 0
  function renderGroup(gid, keepScroll) {
    if (!GBOX) return
    var loadToken = ++groupLoadToken
    if (D.groupSampleFiles && D.groupSampleFiles[gid] &&
        !Object.prototype.hasOwnProperty.call(D.groupSamples, gid)) {
      GBOX.innerHTML = '<div class="empty">正在读取该群精华消息…</div>'
      fetch(D.groupSampleFiles[gid]).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json()
      }).then(function (rows) {
        D.groupSamples[gid] = rows
        if (loadToken === groupLoadToken) renderGroup(gid, keepScroll)
      }).catch(function (e) {
        if (loadToken !== groupLoadToken) return
        GBOX.innerHTML = '<div class="empty">该群消息读取失败：' + esc(e.message) + '</div>'
        var retry = document.createElement('button')
        retry.className = 'more'
        retry.textContent = '重新加载该群'
        retry.addEventListener('click', function () { renderGroup(gid, keepScroll) })
        GBOX.appendChild(retry)
      })
      return
    }'''
    assert original in html
    html = html.replace(original, replacement, 1)
if 'PACKED_ESSENCE_BOOTSTRAP' not in html:
    start = html.index(';(function () {\n  var fns = ["__SB_APP_1"')
    end = html.index('})()', start)+5
    bootstrap = '''/* PACKED_ESSENCE_BOOTSTRAP */
;(async function () {
  var status = document.getElementById('subline')
  var controls = document.querySelectorAll('button,input,select')
  for (var c of controls) c.disabled = true
  status.textContent = '正在读取精华图文数据…'
  try {
    var response
    if ('DecompressionStream' in window) {
      response = await fetch('essence-data.json.gz')
      if (!response.ok) throw new Error('HTTP ' + response.status)
      var decoded = response.body.pipeThrough(new DecompressionStream('gzip'))
      window.__SB_DATA = await new Response(decoded).json()
    } else {
      response = await fetch('viz-data.json')
      if (!response.ok) throw new Error('HTTP ' + response.status)
      window.__SB_DATA = await response.json()
    }
    var fns = ['__SB_APP_1', '__SB_APP_2a', '__SB_APP_2b', '__SB_APP_2c', '__SB_APP_3', '__SB_APP_4']
    for (var name of fns) window[name]()
    for (var c of controls) c.disabled = false
  } catch (e) {
    console.error(e)
    status.textContent = '精华数据加载失败：' + e.message + '。'
    var retry = document.createElement('button')
    retry.textContent = '重新加载'
    retry.addEventListener('click', function () { location.reload() })
    status.appendChild(retry)
  }
})()'''
    html = html[:start]+bootstrap+html[end:]
p.write_text(html, encoding='utf-8')
print('Legacy HTML', len(html.encode('utf-8')), 'bytes; compressed data', (ROOT/'essence-data.json.gz').stat().st_size, 'bytes')
