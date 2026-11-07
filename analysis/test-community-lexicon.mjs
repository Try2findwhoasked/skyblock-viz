import assert from 'node:assert/strict';
import { TERMS, TOPICS } from './community-lexicon.mjs';
function hits(text) {
  return new Set(TERMS.filter(t=>new RegExp(t.pattern,'i').test(text)&&(!t.context||new RegExp(t.context,'i').test(text))).map(t=>t.name));
}
const cases = [
  ['海伯利安和terminator配装',['Hyperion','Terminator'],[]],
  ['hyp nw itspiura',['Hypixel','净资产'],['Hyperion']],
  ['打M7速通，c50了',['M1–M7','Cata 等级'],[]],
  ['m70 f70 c501',[],['M1–M7','F1–F7','Cata 等级']],
  ['这段代码是callback，银行是banking',[],['Ban']],
  ['先升级hotf再去砍树',['Heart of the Forest','伐木'],['Heart of the Mountain']],
  ['hotm升级挖矿',['Heart of the Mountain','挖矿'],['Heart of the Forest']],
  ['来kuudra t5补给',['Kuudra','Kuudra Tiers'],[]],
  ['t4 eman 怎么打',['Enderman T4','Voidgloom Seraph'],['Kuudra Tiers']],
  ['机器学习复制代码赚到钱了',[],['Minion','Dupe','利润','Flip']],
  ['st sh bs hs',[],['Skytils','SkyHanni','Blaze Slayer']],
  ['Recurving khcl',[],['Hyperion','Terminator','Kuudra']],
  ['我要S+评分',['S+ 评分'],[]],
  ['需要一些shards，带mf的东西',['Shard','Magic Find'],[]],
  ['/nw Someone',['净资产','机器人命令'],[]],
];
for(const [text,positive,negative] of cases){
  const found=hits(text);
  for(const name of positive)assert(found.has(name),`${text}: missing ${name}`);
  for(const name of negative)assert(!found.has(name),`${text}: false positive ${name}`);
}
for(const topic of TOPICS){
  assert(topic.termIndices.length>0);
  assert(topic.termIndices.every(i=>TERMS[i-1].category===topic.id));
}
console.log(`${cases.length} contextual/boundary cases and ${TOPICS.length} topic memberships passed`);
