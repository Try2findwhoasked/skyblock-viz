// 组装 output/matlab/skyblock-viz.html（自包含单文件）
import fs from 'node:fs'

const base = fs.readFileSync('tools/viz-base.html', 'utf8')
const data = JSON.parse(fs.readFileSync('output/matlab/viz-data.json', 'utf8'))
const files = ['tools/viz-a.js', 'tools/vb1.js', 'tools/vb2b.js', 'tools/vb3.js', 'tools/viz-c.js', 'viz-d.js']

// 各段里若残留本地 esc 定义，统一指向全局安全版本
function patchEsc(src) {
  return src.split('\n').map(line => {
    if (/^\s*(const|var)\s+esc\s*=/.test(line)) return '  var esc = window.__esc'
    return line
  }).filter(line => !/^\s*\.replace\(\/>\/g/.test(line) && !/^\s*\(\{\s*'&'/.test(line))
    .join('\n')
}

const parts = files.map(f => patchEsc(fs.readFileSync(f, 'utf8')).split('__SB_DATA__').join('__SB_DATA'))

const helper = [
  'window.__esc = (function () {',
  '  var AMP = String.fromCharCode(38) + "amp;"',
  '  var LT = String.fromCharCode(38) + "lt;"',
  '  var GT = String.fromCharCode(38) + "gt;"',
  '  var QT = String.fromCharCode(38) + "quot;"',
  '  var AP = String.fromCharCode(38) + "#39;"',
  '  return function (s) {',
  '    return String(s).replace(/[&<>"\']/g, function (ch) {',
  '      return ch === "&" ? AMP : ch === "<" ? LT : ch === ">" ? GT',
  '        : ch === \'"\' ? QT : AP',
  '    })',
  '  }',
  '})()',
  'window.__SB_DATA = ' + JSON.stringify(data),
].join('\n')

const boot = [
  ';(function () {',
  '  var fns = ["__SB_APP_1", "__SB_APP_2a", "__SB_APP_2b", "__SB_APP_2c", "__SB_APP_3", "__SB_APP_4"]',
  '  for (var i = 0; i < fns.length; i++) {',
  '    try { window[fns[i]]() } catch (e) {',
  '      console.error(fns[i], e)',
  '      var el = document.getElementById("subline")',
  '      if (el) el.textContent = "渲染失败(" + fns[i] + ")：" + e.message',
  '    }',
  '  }',
  '})()',
].join('\n')

const app = [helper].concat(parts).concat([boot]).join('\n\n')

let html = base.replace('/*__DATA__*/', '').replace('/*__APP__*/', '')
const idx = html.lastIndexOf('</script>')
html = html.slice(0, idx) + '\n' + app + '\n' + html.slice(idx)

const out = 'output/matlab/skyblock-viz.html'
fs.writeFileSync(out, html, 'utf8')
console.log('wrote', out, (fs.statSync(out).size / 1024).toFixed(0) + ' KB')
console.log('parts', parts.length, 'esc patched:', parts.filter(p => p.includes('window.__esc')).length)