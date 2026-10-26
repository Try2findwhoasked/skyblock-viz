import { ocrOf, analysisText } from './tools/ocr-text.mjs'
// 补充原始消息样例到 viz-data.json（按群轮转取样，避免单群刷屏）
import fs from 'node:fs'
import { COMPILED } from './tools/sb-lexicon.mjs'

const cache = JSON.parse(fs.readFileSync('output/essence.json', 'utf8'))
const data = JSON.parse(fs.readFileSync('output/matlab/viz-data.json', 'utf8'))
const MF = 'output/images/manifest.json'
const manifest = fs.existsSync(MF) ? JSON.parse(fs.readFileSync(MF, 'utf8')) : {}

const nowTs = Math.floor(Date.now() / 1000)
const MIN_TS = 1420070400
const MAX_PER_TOPIC = 120
const MAX_PER_GROUP = 100000  // 全量收录
const GROUP_TEXT_LIMIT = 600
const norm = s => String(s || '')
  .replace(/[\u0000-\u001f\u007f]/g, ' ')
  .replace(/[\u0085\u2028\u2029\u00a0\u200b\ufeff]/g, ' ')
  .replace(/\s+/g, ' ').trim()

function parseMsg(m) {
  const texts = [], images = [], others = []
  for (const seg of m.content || []) {
    if (seg.type === 'text') texts.push((seg.data && seg.data.text) || '')
    else if (seg.type === 'image') {
      const u = seg.data && seg.data.url
      if (u) images.push({ url: u, local: manifest[u] || '' })
    } else if (seg.type === 'file') {
      others.push({ type: 'file', name: (seg.data && (seg.data.name || seg.data.file)) || '' })
    }
  }
  return { text: norm(texts.join(' ')), images, others }
}

function topicOf(plain) {
  let best = 'other', bestN = 0
  if (!plain) return best
  for (const t of COMPILED) {
    let total = 0
    for (const r of t.res) {
      r.re.lastIndex = 0
      total += (plain.match(r.re) || []).length
    }
    if (total > bestN) { bestN = total; best = t.id }
  }
  return best
}

// 候选池：topicId -> Map(gid -> [rec, ...])
const pool = {}
for (const t of COMPILED) pool[t.id] = new Map()
pool.other = new Map()

const groupSamples = {}

for (const g of Object.values(cache)) {
  const gs = []
  for (const m of g.msgs || []) {
    const p = parseMsg(m)
    const ocr = ocrOf(m)
    const plain = analysisText(p.text, ocr).replace(/https?:\/\/\S+/g, ' ').replace(/\s+/g, ' ').trim()
    if (!p.text && !p.images.length && !p.others.length) continue
    const ts = m.senderTime > MIN_TS && m.senderTime < nowTs ? m.senderTime : 0
    const rec = {
      gid: g.gid, gname: g.name, level: g.level,
      nick: m.senderNick || '', op: m.operatorNick || '', ts,
      text: p.text.slice(0, 800), ocr,
      images: p.images.slice(0, 8),
      others: p.others.slice(0, 4),
    }
    const tid = topicOf(plain)
    const bucket = pool[tid] || pool.other
    const gidKey = String(g.gid)
    if (!bucket.has(gidKey)) bucket.set(gidKey, [])
    bucket.get(gidKey).push(rec)

    if (gs.length < MAX_PER_GROUP) gs.push({ nick: rec.nick, op: rec.op, ts,
      text: p.text.slice(0, GROUP_TEXT_LIMIT), ocr, images: p.images.slice(0, 8) })
  }
  groupSamples[g.gid] = gs
}

// 按群轮转：每轮从每个群各取 1 条，直到凑满上限
function roundRobin(bucket, limit) {
  const keys = Array.from(bucket.keys())
  const idx = new Map(keys.map(k => [k, 0]))
  const out = []
  let progressed = true
  while (out.length < limit && progressed) {
    progressed = false
    for (const k of keys) {
      if (out.length >= limit) break
      const list = bucket.get(k)
      const i = idx.get(k)
      if (i < list.length) {
        out.push(list[i])
        idx.set(k, i + 1)
        progressed = true
      }
    }
  }
  return out
}

const samples = {}
for (const t of COMPILED) samples[t.id] = roundRobin(pool[t.id], MAX_PER_TOPIC)
const samplesOther = roundRobin(pool.other, MAX_PER_TOPIC)

data.samples = samples
data.samplesOther = samplesOther
data.groupSamples = groupSamples

// 图片映射
let nm = 0
data.imageMap = {}
for (const [url, local] of Object.entries(manifest)) { data.imageMap[url] = local; nm++ }

const allImg = new Set()
for (const g of Object.values(cache)) {
  for (const m of g.msgs || []) {
    for (const seg of m.content || []) {
      if (seg.type === 'image' && seg.data && seg.data.url) allImg.add(seg.data.url)
    }
  }
}
data.imageStats = { total: allImg.size, downloaded: nm }

fs.writeFileSync('output/matlab/viz-data.json', JSON.stringify(data), 'utf8')

const gCount = Object.values(groupSamples).reduce((a, v) => a + v.length, 0)
const gMax = Math.max.apply(null, Object.values(groupSamples).map(v => v.length))
console.log('groupSamples total=' + gCount + ' max=' + gMax +
  ' groups=' + Object.keys(groupSamples).length)

const diversity = arr => new Set(arr.map(x => String(x.gid))).size
console.log('OK samples:', Object.keys(samples).map(k =>
  k + '=' + samples[k].length + '/' + diversity(samples[k]) + 'g').join(' '))
console.log('   other=' + samplesOther.length + '/' + diversity(samplesOther) + 'g',
  'groups=' + Object.keys(groupSamples).length)
console.log('   images', nm + '/' + data.imageStats.total)
console.log('   size', (fs.statSync('output/matlab/viz-data.json').size / 1024).toFixed(0) + ' KB')