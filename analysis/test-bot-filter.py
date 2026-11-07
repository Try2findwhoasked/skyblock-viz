from bot_filter import reason, BOT_NAME

positives = [
    '那我缺的jrrp谁来给我补', '这个bot坏了', '/pf找车队吧', '/pf，每天晚上车挺多的', '/nw Someone', '/skb nw Recurving', '/hyp zombies AA 2/3', 'jrrp',
    'UID:37F3DE0723EAD1064FA79D9D7F4EA01D 签到成功 累计签到:1',
    '你今天已经签到过了 当前累计签到:1', '有没有机器人', 'HSBot 查询失败',
    '输入 /nw Someone 查询', '截图里面写了签到奖励', '今日运势不错',
    '\x00/nw Someone', '/ｎｗ Someone',
]
negatives = [
    'm7地牢来人', 'lf safari', '海伯利安和term怎么配装', '/warp hub',
    '/party join Player', '我的nw比你高', 'nw是什么', '今天花园做任务',
    '这个模组支持挖矿路径点', 'AI能不能写攻略', '签到任务怎么完成',
]
for text in positives:
    assert reason(text), ('missed bot content', text)
for text in negatives:
    assert not reason(text), ('removed regular discussion', text)
assert reason('hello', 'known', {'known'}) == 'bot_sender'
assert BOT_NAME.search('SkyBlockBot')
assert not BOT_NAME.search('Minecraft Fan')
print(len(positives), 'bot cases and', len(negatives), 'regular-discussion cases passed')
