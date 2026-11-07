"""Shared, auditable filter for bot-related content; private sender keys stay local."""
import json
from pathlib import Path
import re
import unicodedata

VERSION = '2026-11-07-bots-v1'
BOT_NAME = re.compile(r'机器人|(?:^|[^a-z0-9_])[a-z0-9_-]*bot(?:$|[^a-z0-9_])', re.I)
PRIVATE = Path('D:/Documents/SkyBlockTraining/analysis/full-chat')
COMMAND = re.compile(r'(?:^|\s|[“"「（(])[\/!！.#。](?:nw|networth|nwm|skb|hyp|skyblock|profile|pf|inv|inventory|jrrp|sign|signin|签到|运势|price|player|skycrypt|bz|ah)(?![a-z0-9_])', re.I)
BARE_COMMAND = re.compile(r'^\s*(?:(?:nw|jrrp|签到|运势)(?:\s+\S+)?|(?:skb|hyp)\s+(?:nw|pf|inv|price|profile)\b.*)\s*$', re.I)
REFERENCE = re.compile(r'机器人|(?<![a-z0-9_])(?:bots?|axtbot|hsbot|hypbot|jrrp)(?![a-z0-9_])', re.I)
REPLY = re.compile(r'^\s*(?:UID\s*[:：]|UUID\s*[:：]|签到成功|你今天已经签到过了|今日已签到|签到奖励|今日人品|今日运势|查询结果\s*[:：]|玩家不存在|未找到该玩家|该玩家未绑定|绑定成功|请输入玩家(?:名|名称)|查询失败\s*[:：]|net\s*worth\s*[:：])|累计签到\s*[:：]|-签到奖励-|\b(?:API request failed|player not found|invalid player name)\b', re.I)
FIELDS = re.compile(r'(?:玩家|ID|UUID|等级|净资产|skill average|skyblock level|bank)\s*[:：]', re.I)


def reason(text, sender='', bot_senders=()):
    text = unicodedata.normalize('NFKC', text)
    text = re.sub(r'[\x00-\x1f\x7f\u200b\ufeff]', ' ', text)
    if sender and sender in bot_senders:
        return 'bot_sender'
    if COMMAND.search(text) or BARE_COMMAND.search(text):
        return 'command'
    if REPLY.search(text) or re.search(r'签到成功|签到奖励|今日运势|累计签到', text) or len(FIELDS.findall(text)) >= 3:
        return 'automated_reply'
    if REFERENCE.search(text):
        return 'bot_reference'
    return ''


def load_senders():
    path = PRIVATE/'bot-senders.json'
    return set(json.loads(path.read_text(encoding='utf-8'))) if path.exists() else set()
