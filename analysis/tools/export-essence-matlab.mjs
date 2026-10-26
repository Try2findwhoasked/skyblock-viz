import { ocrOf, analysisText } from './ocr-text.mjs'
// 把 output/essence.json 导出成 MATLAB 友好数据
// 产物目录: output/matlab/
//   msgs.tsv    每条精华消息一行（制表符分隔，文本已清洗掉 tab/换行）
//   groups.tsv  每个群一行
//   msgs.csv / groups.csv  同内容的 CSV 版本（供人看）
//   meta.json   总体统计
import fs from 'node:fs'

const IN = 'output/essence.json'
const DIR = 'output/matlab'
fs.mkdirSync(DIR, { recursive: true })

const cache = JSON.parse(fs.readFileSync(IN, 'utf8'))

// 关键：必须彻底清除一切会让 readtable 断行的字符（\r \n U+2028 U+2029 U+0085 等）
const clean = s => String(s || '')
  .replace(/[\u0000-\u001f\u007f]/g, ' ')
  .replace(/[\u0085\u2028\u2029\u00a0\u200b\ufeff]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const csvCell = v => {
  const s = String(v ?? '')
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}
const tsvCell = v => clean(String(v ?? ''))

const msgHead = ['gid', 'groupName', 'level', 'purity', 'seq', 'mid', 'sender', 'senderNick',
  'senderTime', 'senderTS', 'operator', 'operatorNick', 'nText', 'nImage', 'nFile',
  'nFace', 'nOther', 'chars', 'urls', 'text', 'ocr', 'analysisText']
const msgList = []

const grpHead = ['gid', 'groupName', 'level', 'size', 'purity', 'createTS', 'nMsgs',
  'nText', 'nImage', 'nDistinctSender', 'nDistinctOperator', 'firstTS', 'lastTS',
  'spanDays', 'chars', 'description']
const grpList = []

let totalChars = 0
let totalText = 0
const now = Math.floor(Date.now() / 1000)

for (const g of Object.values(cache)) {
  const msgs = g.msgs || []
  let nText = 0, nImage = 0, chars = 0
  const senders = new Set()
  const operators = new Set()

  for (const m of msgs) {
    const segs = m.content || []
    const textParts = []
    let mi = 0, mf = 0, mfa = 0, mo = 0
    for (const s of segs) {
      if (s.type === 'text') textParts.push((s.data && s.data.text) || '')
      else if (s.type === 'image') mi++
      else if (s.type === 'file') mf++
      else if (s.type === 'face') mfa++
      else mo++
    }
    const text = clean(textParts.join(' '))
    const urls = (text.match(/https?:\/\/\S+/g) || []).length
    const ts = m.senderTime > 0 ? m.senderTime : 0
    if (text) nText++
    if (mi) nImage++
    chars += text.length
    senders.add(m.sender)
    operators.add(m.operator)

    msgList.push([g.gid, g.name, g.level, g.purity, m.seq, m.mid, m.sender, m.senderNick,
      ts, ts ? new Date(ts * 1000).toISOString().slice(0, 19).replace('T', ' ') : '',
      m.operator, m.operatorNick, textParts.length, mi, mf, mfa, mo, text.length, urls, text, ocrOf(m), analysisText(text, ocrOf(m))])
  }

  // 有效时间戳（排除明显异常：早于 2015 或晚于现在）
  const valid = msgs.map(m => m.senderTime).filter(t => t > 1420070400 && t < now)
  const vFirst = valid.length ? Math.min(...valid) : 0
  const vLast = valid.length ? Math.max(...valid) : 0
  const spanDays = vFirst ? Math.round((vLast - vFirst) / 86400) : 0

  totalChars += chars
  totalText += nText

  grpList.push([g.gid, g.name, g.level, g.size, g.purity, g.createTime, msgs.length,
    nText, nImage, senders.size, operators.size, vFirst, vLast, spanDays, chars,
    clean(g.description).slice(0, 200)])
}

const writeBoth = (base, head, list) => {
  fs.writeFileSync(`${DIR}/${base}.tsv`,
    [head.join('\t')].concat(list.map(r => r.map(tsvCell).join('\t'))).join('\r\n'), 'utf8')
  fs.writeFileSync(`${DIR}/${base}.csv`,
    '\ufeff' + [head.join(',')].concat(list.map(r => r.map(csvCell).join(','))).join('\r\n'), 'utf8')
}

writeBoth('msgs', msgHead, msgList)
writeBoth('groups', grpHead, grpList)

const meta = {
  generatedAt: new Date().toISOString(),
  groups: grpList.length,
  msgs: msgList.length,
  textMsgs: totalText,
  chars: totalChars,
  levels: Object.values(cache).reduce((a, g) => { a[g.level] = (a[g.level] || 0) + 1; return a }, {}),
}
fs.writeFileSync(`${DIR}/meta.json`, JSON.stringify(meta, null, 2), 'utf8')

console.log(`groups : ${grpList.length} 群`)
console.log(`msgs   : ${msgList.length} 条（${totalText} 条含文本）`)
console.log(`总字数 : ${totalChars}`)
console.log(`目录   : ${DIR}`)