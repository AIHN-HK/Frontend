require('./register-typescript.cjs');
const assert=require('node:assert/strict');
(async()=>{
 const {createQuizDraftStorage}=require('../src/storage/quizDraftStorage.ts');
 const rows=new Map([['huong-nghiep-quiz','unowned-legacy']]);
 let release;const gate=new Promise(r=>release=r);let delayed=false;
 const raw={getItem:async key=>{const value=rows.get(key)??null;if(delayed)await gate;return value;},setItem:async(k,v)=>rows.set(k,v),removeItem:async k=>rows.delete(k)};
 const s=createQuizDraftStorage(raw);
 assert.equal(await s.getItem('ignored'),null);
 s.setOwner(1);await s.setItem('ignored','draft-A');
 s.setOwner(null);assert.equal(await s.getItem('ignored'),null);assert.equal(rows.get('huong-nghiep-quiz:1'),'draft-A');
 s.setOwner(2);assert.equal(await s.getItem('ignored'),null);await s.setItem('ignored','draft-B');
 s.setOwner(1);assert.equal(await s.getItem('ignored'),'draft-A');
 delayed=true;const old=s.getItem('ignored');s.setOwner(2);release();assert.equal(await old,null,'late hydration cannot restore A into B');
 console.log('PASS: namespaced quiz drafts, logout retention, legacy isolation and late hydration');
})().catch(e=>{console.error(e);process.exitCode=1;});
