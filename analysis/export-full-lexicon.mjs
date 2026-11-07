import { TERMS, TOPICS, CATEGORIES, VERSION, SOURCES, NOTES } from './community-lexicon.mjs';
import { writeFileSync } from 'node:fs';
writeFileSync(new URL('./full-chat-lexicon.json',import.meta.url), JSON.stringify({version:VERSION,terms:TERMS,topics:TOPICS,categories:CATEGORIES,sources:SOURCES,notes:NOTES},null,2));
console.log(`${TERMS.length} terms / ${TOPICS.length} topics`);
