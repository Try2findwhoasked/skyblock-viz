// Shared dictionary for ordinary chat and essence. Literal aliases have ASCII
// token boundaries; Chinese aliases are substrings. No player-name inference.
export const VERSION = '2026-11-07.2';
const definitions = [
 ['core','游戏与档案','#9fc8ff'],['weapon','武器与配装','#ffad77'],
 ['armor','护甲与装备','#f8cc6b'],['stats','属性与强化','#c3e88d'],
 ['pet','宠物','#ff96bc'],['dungeon','地牢','#bc9cff'],
 ['kuudra','Kuudra 与绯红岛','#ff956d'],['slayer','Slayer','#ff799d'],
 ['mining','挖矿','#76d7e8'],['farming','农业与花园','#c8db6c'],
 ['fishing','钓鱼','#72c4fa'],['foraging','伐木与狩猎','#7cdbb5'],
 ['rift','裂隙','#c5a2ff'],['economy','经济与交易','#f2cf7c'],
 ['progress','成长与收集','#a4d6cc'],['event','活动与市长','#eab4ff'],
 ['mods','模组与工具','#96b6ff'],['security','账号与安全','#f494a6'],
 ['network','连接与性能','#95cbd7'],['social','组队与社群','#d4b5ef'],
 ['help','求助与攻略','#b4d594'],['daily','日常与情绪','#e8a8ce'],
 ['othergame','其他游戏','#d1bda2'],['tech','电脑与 AI','#a4b7df'],
];
export const CATEGORIES = Object.fromEntries(definitions.map(([id,name,color])=>[id,{name,color}]));
const blocks = {
core: String.raw`SkyBlock|skyblock;sky block;skyblok;skb;天块;天空方块;空岛
Hypixel|hypixel;hyp;海像素
Minecraft|minecraft;我的世界;mc
Co-op|coop;co-op;合作档
Ironman|ironman;铁人档;铁人模式
Stranded|stranded;滞留模式
Bingo 档|bingo profile;宾果档
档案|profile;存档;档案
Hub|hub;主城;大厅
私人岛屿|private island;私人岛屿
净资产|networth;net worth;nw;净资产
API|api;api接口
SkyCrypt|skycrypt;sky shiiyu
博物馆|museum;博物馆
装备仓库|wardrobe;衣柜
背包与仓库|backpack;ender chest;storage;背包;末影箱
Sack|sack;物品袋`,
weapon: String.raw`Hyperion|hyperion;海伯利安;海伯;亥伯龙;亥伯利安;海波
Scylla|scylla;斯库拉
Astraea|astraea;阿斯特莉亚
Valkyrie|valkyrie;瓦尔基里
Wither Impact|wither impact;凋零冲击
Terminator|terminator;term;终结者;终结弓
Juju|juju;juju bow;juju shortbow
Midas 武器|midas;迈达斯;米达斯;金铲
Aspect of the End|aspect of the end;aote
Aspect of the Void|aspect of the void;aotv
Aspect of the Dragons|aspect of the dragons;aotd
Giant's Sword|giant's sword;giants sword;巨人剑
Dark Claymore|dark claymore;黑暗阔剑;暗黑阔剑
Livid Dagger|livid dagger;livid;利维德
Shadow Fury|shadow fury;暗影狂怒
Flower of Truth|flower of truth;真理之花
Bouquet of Lies|bouquet of lies;谎言花束
Spirit Sceptre|spirit sceptre;spirit scepter;灵魂权杖
Glacial Scythe|glacial scythe;冰川镰刀
Frozen Scythe|frozen scythe;冰冻镰刀
Bonzo's Staff|bonzo staff;bonzo's staff
Yeti Sword|yeti sword;雪人剑
Reaper Scythe|reaper scythe;死神镰刀
Atomsplit Katana|atomsplit;原子分裂;原子刀
Vorpal Katana|vorpal katana
Voidwalker Katana|voidwalker katana
Daedalus Axe|daedalus axe;代达罗斯;戴达罗斯
Ragnarock Axe|ragnarock axe;诸神黄昏斧
Axe of the Shredded|axe of the shredded;aots
Gyrokinetic Wand|gyrokinetic wand;陀螺杖
Ice Spray Wand|ice spray wand;冰喷
Bonemerang|bonemerang;骨头回旋镖
Last Breath|last breath
武器|weapon;武器;配装
短弓|shortbow;短弓`,
armor: String.raw`Necron|necron;尼克龙;死灵甲
Storm|storm;风暴甲
Goldor|goldor;戈尔多
Maxor|maxor;麦克索
Crimson|crimson;绯红甲
Aurora|aurora;极光甲
Terror|terror armor;terror;恐惧甲
Fervor|fervor;狂热甲
Hollow|hollow armor;hollow;空洞甲
Infernal 强化|infernal armor;infernal crimson;地狱绯红
Frozen Blaze|frozen blaze;冰霜烈焰;冰火甲
Shadow Assassin|shadow assassin;暗影刺客
Final Destination|final destination;终末甲;终点甲
Sorrow|sorrow;忧伤甲
Divan|divan;迪万;迪瓦
Glacite|glacite;冰川甲
Fermento|fermento;发酵甲
Squash|squash armor;南瓜甲
Cropie|cropie armor
Young Dragon|young dragon;幼龙甲
Superior Dragon|superior dragon;超强龙甲;至尊龙甲
Wise Dragon|wise dragon;智慧龙甲
Warden Helmet|warden helmet;warden;守望头
Reaper Mask|reaper mask;死神面具
Golden Head|golden head;金头
Diamond Head|diamond head;钻头盔;钻石头
Spirit Mask|spirit mask;灵魂面具
Bonzo's Mask|bonzo mask;bonzo's mask
Wither Goggles|wither goggles;凋零护目镜
Equipment|equipment;配件;项链;腰带;手套;披风
Molten Equipment|molten necklace;molten cloak;molten belt;molten bracelet
护甲|armor;armour;护甲;盔甲`,
stats: String.raw`Magical Power|magical power;mp;魔法力量;魔力值
Magic Find|magic find;mf;魔法发现;魔寻
Pet Luck|pet luck;宠物幸运
Attack Speed|attack speed;攻速
Crit Chance|crit chance;暴击率
Crit Damage|crit damage;暴击伤害;暴伤
Strength|strength;力量属性
Intelligence|intelligence;智力属性
Ferocity|ferocity;残暴;凶猛
True Defense|true defense;真实防御
EHP|ehp;有效生命
Vitality|vitality;活力属性
Mana Pool|mana pool;法力池
Mana Regeneration|mana regeneration;法力回复
Dominance|dominance;支配
Lifeline|lifeline;生命线
Speed|movement speed;移速;移动速度
Damage|damage;dps;伤害;秒伤
附魔|enchant;enchanting;附魔
重铸|reforge;重铸
重组|recombobulator;recomb;重组器;重组
Master Star|master star;大师星
升星|starred;升星;五星;十星
Hot Potato Book|hot potato book;hpb;热土豆书
Fuming Potato Book|fuming potato book;熏制土豆书
Ultimate Wise|ultimate wise;终极智慧
Legion|legion;军团附魔
Soul Eater|soul eater;噬魂
Fatal Tempo|fatal tempo;致命节奏
Duplex|duplex;双重射击
Rend|rend;撕裂
Chimera|chimera;奇美拉
One For All|one for all;ofa;孤注一掷
Swarm|swarm;虫群
Rejuvenate|rejuvenate;回春
Overload|overload;超载
Accessories|accessory;accessories;talisman;talismans;饰品;护符
Power Stone|power stone;力量石
染料|dye;染料
皮肤符文|rune;符文;pet skin;宠物皮肤`,
pet: String.raw`宠物|pet;pets;宠物
Golden Dragon|golden dragon;gdrag;金龙
Ender Dragon|ender dragon;edrag;末影龙;黑龙
Black Cat|black cat;黑猫
Griffin|griffin;狮鹫
Elephant|elephant;大象宠物
Mooshroom Cow|mooshroom cow;蘑菇牛;哞菇
Bal|bal pet;巴尔宠物
Scatha|scatha;斯卡萨;斯卡莎
Ammonite|ammonite;菊石
Flying Fish|flying fish;飞鱼
Dolphin|dolphin;海豚
Squid|squid pet;鱿鱼宠物
Megalodon|megalodon;巨齿鲨
Blue Whale|blue whale;蓝鲸
Baby Yeti|baby yeti;雪人宠物
Sheep|sheep pet;绵羊宠物
Blaze Pet|blaze pet;烈焰人宠物
Enderman Pet|enderman pet;末影人宠物
Monkey|monkey pet;猴子宠物
Ocelot|ocelot;豹猫
Phoenix|phoenix pet;凤凰宠物
Kat|kat pet;宠物升级
Exp Share|exp share;经验共享
Shelmet|shelmet;龟壳`,
dungeon: String.raw`地牢|dungeon;dungeons;地牢;地下城
Catacombs|catacombs;catacomb;cata;catas;地牢等级
Master Mode|master mode;大师模式
F1–F7|r:(?<![a-z0-9_])f[1-7](?![a-z0-9_])
M1–M7|r:(?<![a-z0-9_])m[1-7](?![a-z0-9_])
Cata 等级|r:(?<![a-z0-9_])c(?:[1-9]|[1-4][0-9]|50)(?![a-z0-9_])
S+ 评分|r:(?<![a-z0-9_])s\+(?![a-z0-9_+]);s+评分
Secrets|secret;secrets;找秘密;秘密点
Blood Room|blood room;blood rush;血房;血门
Puzzle|puzzle;puzzles;解谜;谜题
Trap Room|trap room;陷阱房
Fairy Room|fairy room;仙女房
Wither Door|wither door;凋零门
Mimic|mimic;拟态箱
清怪跑图|clear room;清怪;跑图;清图
速通纪录|personal best;速通;速刷;首通;破纪录
Party Finder|party finder;野队;找队伍
Tank|tank;坦克
Healer|healer;奶妈;治疗职业
Archer|archer;arch;弓手
Mage|mage;法师
Berserker|berserker;berserk;bers;狂战
LCM|lcm;左键法
RCM|rcm;右键法
Carry|carry;carries;carrying;带刷;带过;带本
Necron's Handle|necron's handle;necron handle;handle;凋零柄;手柄
Wither Scroll|wither scroll;凋零卷轴;凋零之盾;暗影扭曲
Dungeon Chest|bedrock chest;地牢宝箱;基岩箱
Kismet Feather|kismet feather;重骰羽毛;羽毛重抽
Blood Skip|blood skip;跳血
Terminal|terminal;terminals;终端;端子
Stonk|stonk;穿墙镐
Bonzo|bonzo;邦佐
Scarf|scarf;斯卡夫
Professor|the professor;教授boss
Thorn|thorn;荆棘boss
Sadan|sadan;萨丹
Goldor Phase|goldor phase;金柱阶段`,
kuudra: String.raw`Kuudra|kuudra;库德拉;库拉德
Kuudra Tiers|r:(?<![a-z0-9_])t[1-5](?![a-z0-9_])
Crimson Isle|crimson isle;绯红岛
Kuudra Supplies|supply crate;supplies;补给箱;捞补给
Kuudra Stun|kuudra stun;stunner;晕鱼;眩晕鱼
Kuudra Key|kuudra key;库德拉钥匙
Kuudra Teeth|kuudra teeth;kuudra tooth;库德拉牙
Attribute Shard|attribute shard;属性碎片
Heavy Pearl|heavy pearl;重珍珠
Dojo|dojo;道场
Reputation|reputation;声望
Ashfang|ashfang;灰牙
Vanquisher|vanquisher;征服者
Bladesoul|bladesoul;刀魂
Duke|barbarian duke;蛮族公爵
Mage Outlaw|mage outlaw;法师逃犯
Mycelium|mycelium;菌丝
Red Sand|red sand;红沙`,
slayer: String.raw`Slayer|slayer;slayers;猎杀
Revenant Horror|revenant horror;revenant;僵尸猎杀;僵尸slayer
Tarantula Broodfather|tarantula broodfather;tarantula;蜘蛛猎杀;蜘蛛slayer
Sven Packmaster|sven packmaster;sven;狼王;狼slayer
Voidgloom Seraph|voidgloom seraph;voidgloom;eman;末影猎杀;末影slayer;虚空幽魂
Inferno Demonlord|inferno demonlord;烈焰猎杀;烈焰slayer;烈焰恶魔
Riftstalker Bloodfiend|riftstalker bloodfiend;bloodfiend;吸血鬼猎杀;吸血鬼slayer
Judgement Core|judgement core;judgment core;审判核心
Warden Heart|warden heart;守望之心
Overflux|overflux;大电容
Plasmaflux|plasmaflux;等离子电容
Sos Flare|sos flare;sos信号弹
Enderman T4|r:(?:t4\s*(?:eman|voidgloom)|(?:eman|voidgloom)\s*t4);t4小黑
Blaze Slayer|blaze slayer;烈焰人猎杀`,
mining: String.raw`挖矿|mining;挖矿;挂矿
Heart of the Mountain|heart of the mountain;hotm;山之心
Mithril|mithril;秘银
Titanium|titanium;钛矿
Gemstone|gemstone;gemstones;宝石
Dwarven Mines|dwarven mines;矮人矿坑
Crystal Hollows|crystal hollows;水晶洞穴
Glacite Tunnels|glacite tunnels;冰川隧道
Mineshaft|mineshaft;矿井
Crystal Nucleus|crystal nucleus;水晶核心;跑核
Powder|mithril powder;gemstone powder;glacite powder;挖粉;刷粉;秘银粉;宝石粉
Commissions|commission;commissions;委托任务
Mining Speed|mining speed;挖掘速度;挖速
Mining Fortune|mining fortune;挖掘幸运;矿运
Pristine|pristine;纯净属性
Drill|drill;drills;钻机;钻头
Pickonimbus|pickonimbus;皮克镐
Gemstone Gauntlet|gemstone gauntlet;宝石手套
Fuel Tank|fuel tank;油箱
Jungle Pickaxe|jungle pickaxe;丛林镐
Worm Fishing|worm fishing;挂虫;钓虫
Worm Membrane|worm membrane;虫膜
Metal Detector|metal detector;金属探测器
Nucleus Run|nucleus run;核跑
Glossy Gemstone|glossy gemstone;光泽宝石`,
farming: String.raw`农业|farming;农业;种田;种地
Garden|garden;花园
Farming Fortune|farming fortune;ff;农业幸运;种植幸运
Jacob's Contest|jacob contest;jacob's contest;雅各布;作物竞赛;农业竞赛
Pest|pest;pests;害虫;抓虫
Vacuum|vacuum;吸尘器
Visitor|visitor;visitors;访客
Composter|composter;堆肥机
Sprayonator|sprayonator;喷洒器
Lotus|lotus;莲花配件
Anita|anita;安妮塔
Dedication|dedication;奉献附魔
Cultivating|cultivating;耕耘附魔
Bountiful|bountiful;丰收重铸
Melon Dicer|melon dicer;西瓜斧
Pumpkin Dicer|pumpkin dicer;南瓜斧
Cactus Knife|cactus knife;仙人掌刀
Fungi Cutter|fungi cutter;蘑菇刀
Sugar Cane Hoe|turing sugar cane hoe;甘蔗锄
Nether Wart Hoe|newton nether warts hoe;疣锄
Farming Weight|farming weight;农业权重`,
fishing: String.raw`钓鱼|fishing;钓鱼;鱼趴;钓鱼趴
Sea Creature|sea creature;sea creatures;海怪
Sea Creature Chance|sea creature chance;scc;海怪概率
Fishing Speed|fishing speed;钓鱼速度
Trophy Fish|trophy fish;trophy fishing;奖杯鱼;战利品鱼
Lava Fishing|lava fishing;岩浆钓鱼;熔岩钓鱼
Thunder|thunder sea creature;雷鱼
Jawbus|jawbus;颚巴斯
Golden Fish|golden fish;金鱼
Magma Lord|magma lord;熔岩领主
Thunder Armor|thunder armor;雷霆甲
Magma Rod|magma rod;熔岩钓竿
Inferno Rod|inferno rod;地狱钓竿
Hellfire Rod|hellfire rod;狱火钓竿
Rod of the Sea|rod of the sea;海洋之竿
Double Hook|double hook;双钩
Fishing Festival|fishing festival;钓鱼节
Shark|great white shark;大白鲨
Yeti|yeti sea creature;雪人海怪`,
foraging: String.raw`伐木|foraging;伐木;砍树
Heart of the Forest|heart of the forest;hotf;林之心;森林之心
Galatea|galatea;加拉蒂亚
Hunting|hunting;狩猎
Safari|safari;狩猎团
Shard|shard;shards;碎片
Forest Whispers|forest whispers;森林低语
Treecapitator|treecapitator;砍树斧
Jungle Axe|jungle axe;丛林斧
Hunting Box|hunting box;狩猎盒
Fishing Net|fishing net;渔网
Attribute Fusion|attribute fusion;属性融合
Tree Gifts|tree gift;tree gifts;树木礼物`,
rift: String.raw`Rift|rift;裂隙;裂缝
Motes|motes;微粒
Rift Time|rift time;裂隙时间
Mirrorverse|mirrorverse;镜像世界
Vampire|vampire;吸血鬼
Rift Necklace|rift necklace;裂隙项链
Rift Prism|rift prism;裂隙棱镜
Enigma Souls|enigma soul;enigma souls;谜之灵魂
Mountaintop|mountaintop;山顶区域`,
economy: String.raw`金币|coin;coins;金币
Bazaar|bazaar;bazzar;bz;交易所
Auction House|auction house;auction;ah;拍卖行;拍卖
BIN|bin auction;lowest bin;lbin;一口价
Flip|flip;flipping;倒卖;囤货;炒价
物价|price;prices;价格;物价;多少钱;报价
利润|profit;profits;利润;盈亏
时薪收益|money making;时薪;每小时收益;赚钱方法
交易|trade;trading;交易;出售;收购
税费|auction tax;bazaar tax;手续费;交易税
Booster Cookie|booster cookie;cookie;cookies;饼干
Bits|bits;比特
Gems|skyblock gems;宝石点券
Bank|bank;银行
Buy Order|buy order;买单
Sell Offer|sell offer;sell order;卖单
AutoBuy|autobuy;自动抢购
RMT|rmt;irl trading;现实交易;线下交易
代充代购|代充;代购;折代购
买卖账号|出号;收号;卖号;买号;白号;黑号
质保|质保;担保;中介
Shen’s Auction|shens auction;shen's auction;沈的拍卖`,
progress: String.raw`SkyBlock 等级|skyblock level;sb level;天块等级
Skills|skill;skills;技能
Skill Average|skill average;技能平均
Collection|collection;collections;收集等级
Bestiary|bestiary;怪物图鉴
Fairy Souls|fairy soul;fairy souls;仙女灵魂
Minion|minion;minions;小人;仆从
Minion Slots|minion slot;minion slots;小人槽
Inferno Minion|inferno minion;烈焰小人
Slime Minion|slime minion;史莱姆小人
Slime AFK|slime afk;挂机史莱姆
Combat|combat;战斗技能
Alchemy|alchemy;炼药
Carpentry|carpentry;木工
Taming|taming;驯兽
Social Skill|social skill;社交等级
Dungeon Essence|wither essence;dragon essence;凋零精华;龙精华
RNG|rng;drop;drops;掉落;爆率;掉率
RNG Meter|rng meter;rng进度
Progression|progression;游戏进度;发育路线
Rift Transferrable|rift transferable;裂隙转移`,
event: String.raw`Bingo|bingo;宾果
Jerry|jerry;杰瑞
Diana|diana;戴安娜
Derpy|derpy;德皮
Cole|cole;科尔
Marina|marina;玛丽娜
Paul|paul;保罗
Aatrox|aatrox;亚托克斯
Scorpius|scorpius;天蝎市长
Finnegan|finnegan;芬尼根
Mayor|mayor;mayors;市长;市长选举
Mythological Ritual|mythological ritual;神话仪式;挖狮鹫
Spooky Festival|spooky festival;spooky;恐怖节;万圣节
Jerry's Workshop|jerry workshop;jerry's workshop;杰瑞工坊
Season of Jerry|season of jerry;杰瑞季
Mining Fiesta|mining fiesta;挖矿狂欢
周年庆|anniversary;周年庆
Fire Sale|fire sale;限时皮肤
更新公告|patch notes;update;updates;更新公告;版本更新
Alpha|alpha;测试服
Buff / Nerf|buff;buffs;nerf;nerfed;削弱;加强
Balancing|balancing;平衡改动`,
mods: String.raw`模组|mod;mods;模组
NEU|neu;not enough updates
Skytils|skytils
SkyHanni|skyhanni
SBE|sbe;skyblock extras
Soopy|soopy;soopyv2
Skyblocker|skyblocker
Dungeon Rooms|dungeon rooms;dungeonrooms
SkyGuide|skyguide
ChatTriggers|chattriggers
Forge|forge
Fabric|fabric
Badlion|badlion;blc
Lunar|lunar client;lunar
OptiFine|optifine
Sodium|sodium
Patcher|patcher
材质光影|resource pack;texture pack;shader;shaders;材质包;光影
Waypoint|waypoint;waypoints;路径点;航点
Macro|macro;macros;宏脚本;自动脚本
机器人命令|r:(?:^|\s)/(?:nw|skb|hyp|pf|networth|skyblock)(?![a-z0-9_]);查净资产
Wiki 攻略站|wiki;维基`,
security: String.raw`Ban|ban;banned;封号;封禁
Wipe|wipe;wiped;删档;清档
RAT|rat;ratted;盗号;木马
Dupe|dupe;duping;复制物品;刷物品
漏洞|bug;bugs;exploit;漏洞
外挂|cheat;cheats;cheating;外挂;开挂
诈骗|scam;scammer;诈骗;骗子
Token|token;session;令牌;会话令牌
MFA|mfa;2fa;双重验证
OAuth|oauth;授权登录
申诉|appeal;申诉;解封
Watchdog|watchdog;反作弊
钓鱼网站|phishing;钓鱼网站;钓鱼链接
微软账号|microsoft account;微软账号;微软账户
黑卡|黑卡;盗刷
开盒|开盒;开合;人肉搜索`,
network: String.raw`延迟|ping;latency;延迟
卡顿|lag;laggy;卡顿
断线|disconnect;timeout;掉线;断线;连不上
维护|maintenance;服务器维护;停服
加速器|加速器;代理节点;加速节点
FPS|fps;帧数;帧率
TPS|tps
服务器|server;servers;服务器;伺服器
排队|server queue;服务器排队`,
social: String.raw`公会|guild;guilds;公会
组队|party;组队;组车;开车;缺人
找队友|lfg;lfm;找队友;来人;有人来吗
固定队|固定队;固定车
踢人|party kick;踢队;踢人
独狼|solo;独狼
退坑回坑|退坑;回坑;入坑
萌新|newbie;萌新;新手
Admin|admin;admins;管理员
Rank|rank;会员等级;会员折扣
搬运分享|搬运;转载;分享
直播录屏|直播;录屏;录播
群内事务|群公告;群规;禁言;入群;退群;群主
签到机器人|签到成功;今日运势;签到奖励;jrrp`,
help: String.raw`求助|求助;请问;求教;问一下;help
攻略|guide;tutorial;攻略;教程
推荐配装|配装推荐;怎么配装;装备推荐
路线规划|发育路线;升级路线;怎么提升
机制讨论|机制;怎么触发;计算公式
配置排错|报错;闪退;崩溃;装不上
装备测评|测评;实测;测试伤害`,
daily: String.raw`日常闲聊|吃饭;睡觉;起床;晚安;早安;下班;上班
学习考试|考试;作业;上课;高考;考研;大学;学校
情绪吐槽|笑死;绷不住;难绷;无语;离谱;红温;破防
笑声|哈哈;hhh;2333;笑了
群内玩梗|抽象;乐子;整活;玩梗;典中典
贴贴互动|贴贴;可爱;老婆;老公
争论骂战|吵架;骂战;对线;互喷;傻逼
生活消费|外卖;奶茶;房租;工资
图片表情讨论|表情包;动图;梗图`,
othergame: String.raw`Wynncraft|wynncraft;wynn;温床
Bed Wars|bedwars;bed wars;起床战争
SkyWars|skywars;sky wars;空岛战争
Zombies|hypixel zombies;zombies;僵尸末日
原神|genshin;原神
崩坏星穹铁道|星穹铁道;星铁
三角洲行动|三角洲;delta force
CS2|cs2;csgo;反恐精英
Valorant|valorant;无畏契约;瓦洛兰特
Osu|osu
Roblox|roblox;罗布乐思`,
tech: String.raw`AI|chatgpt;deepseek;claude;gemini;gpt;人工智能
电脑硬件|显卡;cpu;gpu;内存;主板;笔记本
代码开发|python;javascript;matlab;写代码;编程
手机系统|android;ios;安卓;苹果手机
网络平台|bilibili;哔哩哔哩;discord;油管;youtube;抖音`,
};
function literal(alias) {
 const escaped=alias.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return /[a-z0-9]/i.test(alias)&&!/[\u3400-\u9fff]/.test(alias)
   ? `(?<![a-z0-9_])${escaped}(?![a-z0-9_])` : escaped;
}
export const TERMS = Object.entries(blocks).flatMap(([category,block])=>block.split('\n').filter(Boolean).map(line=>{
 const cut=line.indexOf('|'); const name=line.slice(0,cut), aliases=line.slice(cut+1);
 const list=aliases.split(';').sort((a,b)=>b.length-a.length);
 const context = name==='Kuudra Tiers' ? 'kuudra|库德拉|库拉德|捞补给|绯红岛' : '';
 return {name,category,aliases:list,context,pattern:list.map(a=>a.startsWith('r:')?`(?:${a.slice(2)})`:`(?:${literal(a)})`).join('|')};
}));
// A topic is the union of its term hits. A single message is counted once per topic.
export const TOPICS = definitions.map(([id,name,color])=>({id,name,color,termIndices:TERMS.flatMap((t,i)=>t.category===id?[i+1]:[])}));
export const SOURCES = [
 {title:'Local corpus review: 859147 messages, English token candidates and context samples',url:''},
 {title:'Galatea / Heart of the Forest / Hunting',url:'https://hypixelskyblock.minecraft.wiki/w/Galatea'},
 {title:'Kuudra',url:'https://hypixelskyblock.minecraft.wiki/w/Kuudra'},
];
export const NOTES = [
 'hyp maps to Hypixel, not Hyperion: the local corpus uses it for the server and bot commands.',
 'Do not map player IDs, recu​rving, khcl, or short ambiguous sh/st/bs/hs to game entities.',
 'HOTM and HOTF are distinct. Necron armor, handle and boss mentions remain lexically ambiguous.',
 'Removed isolated 赚/亏/炒/宏/机器/合作/安全/复制 as entity aliases to limit generic substring false positives.',
 'Short numeric tier labels and English common words remain possible false positives; this is rule matching, not a semantic classifier.',
];
if(new Set(TERMS.map(t=>t.name)).size!==TERMS.length)throw Error('Duplicate term names');
for(const t of TERMS)new RegExp(t.pattern,'gi');
