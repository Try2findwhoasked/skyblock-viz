"""Keep the legacy gallery HTML small and load its unchanged data compressed."""
import gzip
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT/'viz-data.json').read_text(encoding='utf-8'))
packed = json.dumps(data, ensure_ascii=True, separators=(',', ':')).encode('utf-8')
(ROOT/'essence-data.json.gz').write_bytes(gzip.compress(packed, compresslevel=9, mtime=0))
p = ROOT/'essence-analysis.html'
html = p.read_text(encoding='utf-8')
html = re.sub(r'^window\.__SB_DATA = .+$', '// Essence data loads asynchronously below.', html, flags=re.M)
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
