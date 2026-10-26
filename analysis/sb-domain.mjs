// Hypixel SkyBlock 领域词表（人工精编）
// 设计原则：
//   1) 只用白名单，避免通用虚词与群内梗上榜（如 khcl / 2v88 / 傻逼）
//   2) 每个词可有多写法，统计时合并计数
//   3) 每个词归入一个类别，用于页面按类别着色
export const DOMAIN_CATS = {
  core:     { name: '游戏本体', color: '#4d9fff' },
  gear:     { name: '装备武器', color: '#1a73e8' },
  dungeon:  { name: '地牢副本', color: '#9334e6' },
  mechanic: { name: '玩法机制', color: '#00897b' },
  economy:  { name: '经济交易', color: '#0f9d58' },
  mod:      { name: '工具模组', color: '#5c6bc0' },
  risk:     { name: '账号风险', color: '#d93025' },
  event:    { name: '活动赛季', color: '#f9ab00' },
  meta:     { name: '圈层身份', color: '#ec407a' },
  help:     { name: '求助攻略', color: '#26a69a' },
  people:   { name: '阵营人物', color: '#f0883e' },
}

// pats: 匹配模式；普通字符串自动加 \b 边界（英文）/ 直接子串（中文）
// name: 页面显示名
export const DOMAIN_TERMS = [
  /* ================= 游戏本体 ================= */
  { name: 'SkyBlock',   cat: 'core', pats: ['skyblock', 'sky block', '空岛', '天块', '天空方块', '内扣', 'skyblok'] },
  { name: 'Hypixel',    cat: 'core', pats: ['hypixel', '\\bhyp\\b'] },
  { name: 'Minecraft',  cat: 'core', pats: ['minecraft', '我的世界', 'java版', 'java 版'] },
  { name: '服务器',     cat: 'core', pats: ['服务器', 'server', '伺服器'] },

  /* ================= 装备武器 ================= */
  { name: 'Hyperion',   cat: 'gear', pats: ['hyperion', '海伯利安', '海伯'] },
  { name: 'Terminator', cat: 'gear', pats: ['terminator', '\\bterm\\b', '终结者'] },
  { name: 'Juju',       cat: 'gear', pats: ['juju', 'jujubow', 'juju bow'] },
  { name: 'Necron',     cat: 'gear', pats: ['necron', 'necron armor', '死灵'] },
  { name: 'Storm',      cat: 'gear', pats: ['\\bstorm\\b'] },
  { name: 'Goldor',     cat: 'gear', pats: ['goldor'] },
  { name: 'Maxor',      cat: 'gear', pats: ['maxor'] },
  { name: 'Crimson',    cat: 'gear', pats: ['crimson', '绯红'] },
  { name: 'Shadow',     cat: 'gear', pats: ['shadow assassin', 'shadow fury', '\\bsa\\b(?![a-z])', '暗影'] },
  { name: 'Wither',     cat: 'gear', pats: ['wither', '凋零'] },
  { name: 'Frozen Blaze', cat: 'gear', pats: ['frozen blaze', '冰霜烈焰'] },
  { name: 'Glacite',    cat: 'gear', pats: ['glacite', '冰川'] },
  { name: 'Divan',      cat: 'gear', pats: ['divan', '迪万'] },
  { name: 'Spirit',     cat: 'gear', pats: ['\\bspirit\\b', '幽灵'] },
  { name: 'Livid',      cat: 'gear', pats: ['livid'] },
  { name: 'Sword',      cat: 'gear', pats: ['\\bsword\\b', '剑'] },
  { name: 'Shortbow',   cat: 'gear', pats: ['shortbow', '短弓'] },
  { name: 'Armor',      cat: 'gear', pats: ['\\barmor\\b', '护甲', '盔甲'] },
  { name: '武器',       cat: 'gear', pats: ['武器', '\\bweapon\\b'] },
  { name: '头盔',       cat: 'gear', pats: ['头盔', '\\bhelmet\\b'] },
  { name: '胸甲',       cat: 'gear', pats: ['胸甲', '\\bchestplate\\b'] },
  { name: '护腿',       cat: 'gear', pats: ['护腿', '\\bleggings\\b'] },
  { name: '靴子',       cat: 'gear', pats: ['靴子', '\\bboots\\b'] },
  { name: '饰品护符',   cat: 'gear', pats: ['饰品', '护符', 'talisman', 'accessor', '魔法书'] },
  { name: '附魔',       cat: 'gear', pats: ['附魔', '\\benchant'] },
  { name: '重铸',       cat: 'gear', pats: ['重铸', 'reforge'] },
  { name: '宝石',       cat: 'gear', pats: ['宝石', 'gemstone', '\\bgems?\\b'] },
  { name: '宠物',       cat: 'gear', pats: ['宠物', '\\bpet\\b', '\\bpets\\b'] },
  { name: '属性',       cat: 'gear', pats: ['属性', '\\bstats?\\b', '\\bstat\\b'] },
  { name: '伤害',       cat: 'gear', pats: ['伤害', '\\bdamage\\b'] },
  { name: 'DPS',        cat: 'gear', pats: ['\\bdps\\b'] },
  { name: '暴击',       cat: 'gear', pats: ['暴击', '\\bcrit'] },
  { name: '附魔书',     cat: 'gear', pats: ['附魔书', 'enchanted book'] },

  /* ================= 地牢副本 ================= */
  { name: '地牢',       cat: 'dungeon', pats: ['地牢', '地下城', '\\bdungeon', 'catacomb'] },
  { name: 'Catacombs',  cat: 'dungeon', pats: ['\\bcata\\b', '\\bcatas\\b', 'cata level', '地牢等级'] },
  { name: 'Kuudra',     cat: 'dungeon', pats: ['kuudra', '库德拉'] },
  { name: 'Boss',       cat: 'dungeon', pats: ['\\bboss\\b', '\\bbosses\\b', '首领'] },
  { name: '秘密',       cat: 'dungeon', pats: ['秘密', '\\bsecret'] },
  { name: 'Tank',       cat: 'dungeon', pats: ['\\btank\\b', '坦克'] },
  { name: 'Healer',     cat: 'dungeon', pats: ['\\bhealer\\b', '治疗'] },
  { name: 'Archer',     cat: 'dungeon', pats: ['\\barcher\\b', '弓手'] },
  { name: 'Mage',       cat: 'dungeon', pats: ['\\bmage\\b', '法师'] },
  { name: 'Berserker',  cat: 'dungeon', pats: ['\\bberserk', '狂战'] },
  { name: 'Carry',      cat: 'dungeon', pats: ['\\bcarry\\b', '带刷', '带过'] },
  { name: '楼层',       cat: 'dungeon', pats: ['\\bfloor\\b', '\\bf[1-7]\\b', '\\bm[1-7]\\b', '楼层'] },
  { name: 'S+',         cat: 'dungeon', pats: ['\\bs\\+\\b', 's\\+', 'ss\\+'] },
  { name: '钥匙',       cat: 'dungeon', pats: ['钥匙', '\\bkey\\b'] },
  { name: '副本',       cat: 'dungeon', pats: ['副本', '\\braid\\b'] },

  /* ================= 玩法机制 ================= */
  { name: '挖矿',       cat: 'mechanic', pats: ['挖矿', '\\bmining\\b', '\\bmine\\b'] },
  { name: '钓鱼',       cat: 'mechanic', pats: ['钓鱼', '\\bfishing\\b'] },
  { name: '农业',       cat: 'mechanic', pats: ['农业', '\\bfarming\\b', '\\bfarm\\b'] },
  { name: '砍树',       cat: 'mechanic', pats: ['砍树', '\\bforaging\\b'] },
  { name: '花园',       cat: 'mechanic', pats: ['花园', '\\bgarden\\b'] },
  { name: 'Slayer',     cat: 'mechanic', pats: ['slayer', '\\bsven\\b', '\\brevenant\\b', '\\btarantula\\b', '猎杀'] },
  { name: 'Zealot',     cat: 'mechanic', pats: ['zealot', '狂热者'] },
  { name: '龙',         cat: 'mechanic', pats: ['\\bdragon', '打龙', '刷龙', '龙蛋'] },
  { name: 'Rift',       cat: 'mechanic', pats: ['\\brift\\b', '裂隙'] },
  { name: 'Hub',        cat: 'mechanic', pats: ['\\bhub\\b', '大厅', '主城'] },
  { name: 'Island',     cat: 'mechanic', pats: ['\\bisland\\b', '\\bisle\\b', '空岛岛'] },
  { name: 'Profile',    cat: 'mechanic', pats: ['\\bprofile\\b', '存档', '\\bcoop\\b', '合作模式'] },
  { name: 'NPC',        cat: 'mechanic', pats: ['\\bnpc\\b'] },
  { name: 'RNG',        cat: 'mechanic', pats: ['\\brng\\b', '\\bdrop\\b', '掉落', '爆率'] },
  { name: '技能',       cat: 'mechanic', pats: ['技能', '\\bskill'] },
  { name: '等级',       cat: 'mechanic', pats: ['等级', '\\blevel\\b'] },
  { name: '任务',       cat: 'mechanic', pats: ['任务', '\\bquest'] },
  { name: 'Minion',     cat: 'mechanic', pats: ['minion', '仆从', '机器', '刷怪笼'] },
  { name: 'Mana',       cat: 'mechanic', pats: ['\\bmana\\b', '魔力'] },
  { name: '药水',       cat: 'mechanic', pats: ['药水', '\\bpotion'] },
  { name: 'Buff',       cat: 'mechanic', pats: ['\\bbuff', '\\bnerf', '削弱', '加强'] },
  { name: '刷取',       cat: 'mechanic', pats: ['刷取', '刷怪', '刷钱', '刷本', '挂机', '\\bgrind', '\\bfarm'] },
  { name: '效率收益',   cat: 'mechanic', pats: ['效率', '收益', '时薪', '每小时'] },
  { name: '速度',       cat: 'mechanic', pats: ['速度', '\\bspeed\\b'] },
  { name: '传送',       cat: 'mechanic', pats: ['传送', '\\bwarp\\b', '\\btp\\b'] },
  { name: '战斗',       cat: 'mechanic', pats: ['战斗', '\\bcombat\\b', '\\bpvp\\b'] },
  { name: '升级',       cat: 'mechanic', pats: ['升级', '\\blevel up\\b', '\\bupgrade'] },
  { name: 'HOTM',       cat: 'mechanic', pats: ['\\bhotm\\b', '\\bhotf\\b'] },
  { name: 'Collection', cat: 'mechanic', pats: ['collection', '图鉴', '收集'] },

  /* ================= 经济交易 ================= */
  { name: '金币',       cat: 'economy', pats: ['金币', '\\bcoins?\\b', '\\bcoin\\b'] },
  { name: 'Bazaar',     cat: 'economy', pats: ['\\bbazaar\\b', '\\bbazzar\\b', '交易所'] },
  { name: '拍卖行',     cat: 'economy', pats: ['拍卖', '\\bauction', '\\bah\\b'] },
  { name: '价格',       cat: 'economy', pats: ['价格', '\\bprice', '多少钱', '物价'] },
  { name: '利润',       cat: 'economy', pats: ['利润', '\\bprofit', '赚', '亏', '盈亏'] },
  { name: 'Flip',       cat: 'economy', pats: ['\\bflip', '倒卖', '囤货', '炒'] },
  { name: '购买出售',   cat: 'economy', pats: ['购买', '出售', '\\bbuy\\b', '\\bsell\\b'] },
  { name: 'Cookie',     cat: 'economy', pats: ['\\bcookie', '饼干'] },

  /* ================= 工具模组 ================= */
  { name: '模组',       cat: 'mod', pats: ['模组', '\\bmods?\\b', '插件'] },
  { name: 'NEU',        cat: 'mod', pats: ['\\bneu\\b', 'not enough updates'] },
  { name: 'Skytils',    cat: 'mod', pats: ['skytils', '\\bst\\b'] },
  { name: 'SkyHanni',   cat: 'mod', pats: ['skyhanni', '\\bsh\\b'] },
  { name: 'SBE',        cat: 'mod', pats: ['\\bsbe\\b', 'skyblock extras'] },
  { name: 'Soopy',      cat: 'mod', pats: ['soopy'] },
  { name: '客户端',     cat: 'mod', pats: ['客户端', '\\bforge\\b', 'badlion', 'lunar', 'optifine'] },
  { name: '材质光影',   cat: 'mod', pats: ['材质', '光影', '\\bshader', '\\btexture'] },
  { name: 'Waypoint',   cat: 'mod', pats: ['waypoint', '路径点', '航点'] },
  { name: 'FPS',        cat: 'mod', pats: ['\\bfps\\b', '帧数'] },
  { name: '宏脚本',     cat: 'mod', pats: ['\\bmacro', '宏', '脚本', '\\bscript'] },

  /* ================= 账号风险 ================= */
  { name: '封号',       cat: 'risk', pats: ['封号', '封禁', '\\bban\\b', '\\bbanned\\b'] },
  { name: 'Wipe',       cat: 'risk', pats: ['\\bwipes?\\b', '\\bwiped\\b', '\\bwipe\\b', '清空', '删档'] },
  { name: 'RAT',        cat: 'risk', pats: ['\\brat\\b', '盗号', '木马'] },
  { name: 'Dupe',       cat: 'risk', pats: ['\\bdupe\\b', '刷物品', '复制'] },
  { name: '漏洞Bug',    cat: 'risk', pats: ['漏洞', '\\bbugs?\\b', '\\bexploit'] },
  { name: '外挂',       cat: 'risk', pats: ['外挂', '开挂', '黑客', '\\bcheat', '\\bhack'] },
  { name: '诈骗',       cat: 'risk', pats: ['骗子', '诈骗', '\\bscam'] },
  { name: 'API Token',  cat: 'risk', pats: ['\\bapi\\b', '\\btoken\\b', '\\bsession\\b', '验证码'] },
  { name: '申诉解封',   cat: 'risk', pats: ['申诉', '解封', '\\bappeal'] },
  { name: 'Watchdog',   cat: 'risk', pats: ['watchdog', '反作弊'] },
  { name: '安全',       cat: 'risk', pats: ['安全', '被盗', '\\bsecurity\\b'] },

  /* ================= 活动赛季 ================= */
  { name: 'Bingo',      cat: 'event', pats: ['\\bbingo\\b', '宾果'] },
  { name: 'Jerry',      cat: 'event', pats: ['\\bjerry\\b'] },
  { name: 'Spooky',     cat: 'event', pats: ['\\bspooky\\b', '万圣'] },
  { name: '活动',       cat: 'event', pats: ['活动', '\\bevent'] },
  { name: '赛季',       cat: 'event', pats: ['赛季', '\\bseason'] },
  { name: '更新版本',   cat: 'event', pats: ['更新', '版本', '\\bpatch\\b', '\\bupdate', '更新公告'] },
  { name: '周年',       cat: 'event', pats: ['周年', '\\banniversary'] },

  /* ================= 圈层身份 ================= */
  // 注意：MVP/VIP 有 87% 来自聊天前缀 "[MVP+] 玩家名"，属于格式噪音，故不收录
  { name: 'Admin',      cat: 'meta', pats: ['\\badmin', '管理员', '\\bdev\\b', '开发者'] },
  { name: 'Rank',       cat: 'meta', pats: ['\\brank', '段位', '等级牌'] },
  { name: '公会',       cat: 'meta', pats: ['公会', '\\bguild'] },
  { name: '组队',       cat: 'meta', pats: ['组队', '\\bparty\\b', '队伍'] },
  { name: 'Coop',       cat: 'meta', pats: ['\\bcoop\\b', '合作'] },

  /* ================= 求助攻略 ================= */
  { name: '萌新',       cat: 'help', pats: ['萌新', '新手', '新人', '\\bnewbie\\b'] },
  { name: '求助提问',   cat: 'help', pats: ['求助', '提问', '请问', '问一下', '求教'] },
  { name: '大佬',       cat: 'help', pats: ['大佬', '\\bpro\\b'] },
  { name: '攻略教程',   cat: 'help', pats: ['攻略', '教程', '\\bguide', '\\btutorial'] },
  { name: '推荐',       cat: 'help', pats: ['推荐', '\\brecommend'] },

  /* ================= 阵营人物（中文圈子特有） ================= */
  // 注意："泛娱乐" 是本圈特定群内梗（与 SkyBlock 玩法无关），已剔除
  { name: '黑客外挂圈', cat: 'people', pats: ['黑客端', '恶俗', '开盒', '恶俗维基'] },
  { name: '绿玩',       cat: 'people', pats: ['绿玩'] },
]

// 编译：中文直接子串匹配，英文加词边界
const CJK = /[\u4e00-\u9fff]/
export const DOMAIN_COMPILED = DOMAIN_TERMS.map(t => {
  const res = t.pats.map(p => {
    const isCJK = CJK.test(p)
    // 已含 \b 或正则元字符的直接用
    const hasMeta = /[\\^$.*+?()[\]{}|]/.test(p)
    const body = hasMeta ? p : (isCJK ? p : '\\b' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    return new RegExp(body, 'gi')
  })
  return { name: t.name, cat: t.cat, res }
})

// 必须剔除的噪音（群内梗 / 玩家ID / 英文停用词）
export const NOISE = new Set([
  'khcl', 'khcl', 'v88', '2v88', 'xiaohei_awa', 'nori', 'polinex', 'dreamclipse',
  'hib', 'sad', 'gay', 'qwq', 'awa', 'lmyz', 'skb池子',
  'the', 'you', 'and', 'from', 'your', 'for', 'not', 'this', 'have', 'can',
  'with', 'was', 'has', 'out', 'are', 'get', 'been', 'like', 'time', 'that',
  'more', 'will', 'now', 'where', 'them', 'use', 'new', 'run', 'set', 'play',
  'but', 'all', 'one', 'two', 'how', 'who', 'why', 'what', 'when', 'which',
])