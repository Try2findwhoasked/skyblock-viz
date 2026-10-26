// 生成 GitHub Pages 站版 HTML（相对路径适配）
import fs from 'node:fs'

const SRC = 'output/matlab/skyblock-viz.html'
const OUT = 'output/matlab/index.html'

let html = fs.readFileSync(SRC, 'utf8')

// 1) 图片基址：../images/ -> ./images/
html = html.split("var IMG_BASE = '../images/'").join("var IMG_BASE = './images/'")

// 2) 页脚链接：去掉越出根目录的 ../
html = html.split('href="../essence.json"').join('href="essence.json"')
html = html.split('href="../images/manifest.json"').join('href="images/manifest.json"')

fs.writeFileSync(OUT, html, 'utf8')

const checks = {
  'IMG_BASE ./images/': html.includes("var IMG_BASE = './images/'"),
  'IMG_BASE 无 ../images': !html.includes("var IMG_BASE = '../images/'"),
  'essence.json 相对': html.includes('href="essence.json"'),
  'manifest 相对': html.includes('href="images/manifest.json"'),
  '无 ../ 越界链接': !/href="\.\.\//.test(html),
  '内嵌数据存在': html.includes('window.__SB_DATA = '),
}
console.log('== 站版 HTML 生成 ==', OUT, (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB')
for (const [k, v] of Object.entries(checks)) console.log((v ? '  ✓ ' : '  ✗ ') + k)
if (Object.values(checks).some(v => !v)) process.exit(1)