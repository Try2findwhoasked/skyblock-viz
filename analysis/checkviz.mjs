// 无头校验 skyblock-viz.html 的内联脚本
import fs from 'node:fs'
import vm from 'node:vm'

const html = fs.readFileSync('output/matlab/skyblock-viz.html', 'utf8')
const m = html.match(/<script>([\s\S]*?)<\/script>/)
if (!m) { console.error('未找到 script 块'); process.exit(1) }
const code = m[1]

try {
  new vm.Script(code, { filename: 'inline.js' })
  console.log('✓ 语法检查通过')
} catch (e) {
  console.error('✗ 语法错误:', e.message)
  process.exit(1)
}

function mkEl(id) {
  const el = {
    id,
    tagName: 'DIV',
    innerHTML: '',
    textContent: '',
    dataset: {},
    children: [],
    attrs: {},
    classList: { add() {}, remove() {}, contains() { return false } },
    setAttribute(k, v) { this.attrs[k] = v },
    getAttribute(k) { return this.attrs[k] },
    querySelector() { return mkEl(id + '-sub') },
    querySelectorAll() { return [] },
    addEventListener() {},
    scrollIntoView() {},
    closest() { return null },
  }
  return el
}

// lightbox 是静态空节点，只在点击图片时注入，不参与填充校验
const ids = ['subline', 'genAt', 'kpis', 'topicBars', 'topicDetail', 'donut', 'formInsight',
  'monthlyChart', 'monthLegend', 'cooccur', 'coInsight', 'levelChart', 'levelLegend',
  'terms', 'termTable', 'scatter', 'groupTable', 'topicChips', 'topicSamples',
  'groupSamples']
const optional = ['lightbox']
const store = {}
ids.concat(optional).forEach(id => { store[id] = mkEl(id) })

const sandbox = {
  console,
  document: {
    getElementById: id => store[id] || null,
    addEventListener() {},
  },
  Math, Date, JSON, String, Number, Object, Array, RegExp, parseInt, parseFloat, isNaN,
}
sandbox.window = sandbox
vm.createContext(sandbox)

try {
  vm.runInContext(code, sandbox, { filename: 'inline.js' })
  console.log('✓ 渲染脚本执行完成')
} catch (e) {
  console.error('✗ 运行错误:', e.message)
  process.exit(1)
}

let bad = 0
for (const id of ids) {
  const v = store[id]
  const len = (v.innerHTML || '').length + (v.textContent || '').length
  const filled = len > 0
  if (!filled) bad++
  console.log(`${filled ? '✓' : '✗'} #${id}  ${filled ? len + ' chars' : '空'}`)
}
console.log(`✓ #lightbox 静态节点存在：${!!store.lightbox}`)
console.log(bad === 0 ? '\n全部 ' + ids.length + ' 个内容容器已渲染' : `\n${bad} 个容器为空`)
process.exit(bad === 0 ? 0 : 1)