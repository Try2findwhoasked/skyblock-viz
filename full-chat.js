'use strict';
const el = id => document.getElementById(id);
const number = n => n.toLocaleString('zh-CN');
const pct = (n, d) => d ? (100*n/d).toFixed(1)+'%' : '0.0%';
function textNode(tag, text) {const n=document.createElement(tag);n.textContent=text;return n;}
function bars(target, rows, denominator) {
  target.replaceChildren();
  for (const [name, count] of rows) {
    const box=textNode('div','');box.className='bar';
    const top=textNode('div','');top.className='bar-top';
    top.append(textNode('span',name),textNode('span',number(count)+' · '+pct(count,denominator)));
    const track=textNode('div','');track.className='track';
    const fill=textNode('div','');fill.className='fill';fill.style.width=Math.min(100,100*count/(denominator||1))+'%';
    track.append(fill);box.append(top,track);target.append(box);
  }
}
function row(values){const tr=document.createElement('tr');for(const v of values)tr.append(textNode('td',v));return tr;}
function render(data) {
  const g=Number(el('group').value),m=Number(el('month').value),metric=el('metric').value;
  const cells=data.cells.filter(c=>(!g||c.group===g)&&(!m||c.month===m));
  const counts=data.terms.map(()=>0),docs=[...counts],topics=data.topics.map(()=>0);
  let total=0,unmatched=0;
  for(const c of cells){total+=c.messages;unmatched+=c.unmatched;c.counts.forEach((v,i)=>counts[i]+=v);c.docs.forEach((v,i)=>docs[i]+=v);c.topics.forEach((v,i)=>topics[i]+=v);}
  el('messages').textContent=number(total);el('matched').textContent=pct(total-unmatched,total);el('unmatched').textContent=pct(unmatched,total);
  const terms=data.terms.map((t,i)=>({...t,count:counts[i],docs:docs[i]})).filter(t=>t.docs>0).sort((a,b)=>b[metric==='docs'?'docs':'count']-a[metric==='docs'?'docs':'count']||a.name.localeCompare(b.name));
  el('cloud').replaceChildren();
  const max=terms.length?terms[0][metric==='docs'?'docs':'count']:1;
  terms.slice(0,60).forEach((t,i)=>{const n=textNode('span',t.name);n.style.fontSize=(14+38*Math.sqrt(t[metric==='docs'?'docs':'count']/max))+'px';n.style.color=['#83c6ff','#97dfce','#c8b0ff','#ffc18d'][i%4];n.title=`${t.name}：${number(t.count)} 次 / ${number(t.docs)} 条消息`;el('cloud').append(n);});
  if(!terms.length)el('cloud').append(textNode('p','所选范围没有领域词命中。'));
  el('terms').replaceChildren(...terms.map(t=>row([t.name,number(t.count),number(t.docs),pct(t.docs,total)])));
  bars(el('topics'),data.topics.map((t,i)=>[t.name,topics[i]]).sort((a,b)=>b[1]-a[1]),total);
  const timeline=data.months.map((month,i)=>[month,data.cells.filter(c=>(!g||c.group===g)&&c.month===i+1).reduce((s,c)=>s+c.messages,0)]);
  bars(el('timeline'),timeline,timeline.reduce((s,r)=>s+r[1],0));
}
async function main(){
  const response=await fetch('full-chat-data.json');if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  const groups=data.coverage.groups,total=groups.reduce((s,g)=>s+g.total,0),present=groups.filter(g=>g.total>0).length;
  const date=ts=>ts?new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ts*1000)):'—';
  el('coverage').textContent=`既有名单 ${groups.length} 个群 · ${present} 个有本地记录 · ${number(total)} 条原始记录 · ${groups.length-present} 个群无本地记录`;
  groups.forEach((g,i)=>{const option=textNode('option',`${g.groupName} · ${g.level}${g.total?'':' · 无记录'}`);option.value=i+1;el('group').append(option);el('groups').append(row([g.groupName,g.level,number(g.total),number(g.textMessages),date(g.first)+' — '+date(g.last)]));});
  data.months.forEach((m,i)=>{const option=textNode('option',m);option.value=i+1;el('month').append(option);});
  const unknown=groups.reduce((s,g)=>s+g.unknown,0);
  el('engine').textContent=`统计引擎：${data.engine}；${number(unknown)} 条记录未通过结构解码，未纳入文本分析。生成时间：${data.coverage.generatedAt}。网页仅含汇总统计。`;
  for(const id of ['group','month','metric'])el(id).addEventListener('change',()=>render(data));
  render(data);el('status').textContent='';
}
main().catch(error=>{el('status').textContent='分析数据读取失败，请通过本地 HTTP 服务或网站访问此页面。'+error.message;});
