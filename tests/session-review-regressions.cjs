require('./register-typescript.cjs');const assert=require('node:assert/strict');
(async()=>{
 const {createSessionManager}=require('../src/helpers/sessionManager.ts');let deleteFails=false;const rows=new Map();
 const raw={getItem:async k=>rows.get(k)??null,setItem:async(k,v)=>rows.set(k,v),multiRemove:async ks=>{if(deleteFails)throw Error('delete failed');ks.forEach(k=>rows.delete(k));}};
 const s=createSessionManager(raw);let rotations=0;s.subscribe((id,reason)=>{if(reason==='token'){assert.equal(id,1);rotations++;}});
 await s.establish({accessToken:'A',refreshToken:'R',user:{id:1,fullname:'A'}});
 await s.rotate('A',{accessToken:'A2',refreshToken:'R2'});assert.equal(rotations,1,'socket must be notified of token rotation');
 deleteFails=true;await assert.rejects(s.clear('A2'));assert.equal((await s.read()).accessToken,null,'logout deletion failure must fail closed');
 const restarted=createSessionManager(raw);assert.equal((await restarted.read()).accessToken,null,'persisted signout marker blocks stale storage after restart');
 console.log('PASS review regressions: rotation event, fail-closed logout and restart tombstone');
})().catch(e=>{console.error(e);process.exitCode=1;});
