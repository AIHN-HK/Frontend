require('./register-typescript.cjs');
const assert=require('node:assert/strict');const axios=require('axios');
(async()=>{
 const {createSessionManager}=require('../src/helpers/sessionManager.ts');
 const {installSessionInterceptors}=require('../src/helpers/sessionInterceptors.ts');
 const rows=new Map();const s=createSessionManager({getItem:async k=>rows.get(k)??null,setItem:async(k,v)=>rows.set(k,v),multiRemove:async ks=>ks.forEach(k=>rows.delete(k))});
 const login=(id=1)=>s.establish({accessToken:`A${id}`,refreshToken:`R${id}`,user:{id,fullname:'Test'}});
 let refreshes=0,posts=0,gets=0,redirects=0;
 const client=axios.create({adapter:async config=>{
   if(config.method==='post')posts++;else gets++;
   if(config.headers.Authorization?.startsWith('Bearer NEXT'))return {data:{ok:true},status:200,statusText:'OK',headers:{},config};
   throw new axios.AxiosError('Unauthorized','ERR_BAD_REQUEST',config,{}, {status:401,data:{},headers:{},config});
 }});
 installSessionInterceptors(client,s,{refresh:async()=>{refreshes++;await new Promise(r=>setTimeout(r,10));return {accessToken:'NEXT',refreshToken:'RNEXT'};},onSignedOut:()=>redirects++});
 await login();await Promise.all([client.get('/one'),client.get('/two')]);assert.equal(refreshes,1);assert.equal(gets,4);
 await login();await assert.rejects(client.post('/mutation',{answers:[1]}));assert.equal(posts,1);assert.equal(refreshes,1);assert.equal((await s.read()).accessToken,null);
 assert.equal(redirects,1);
 await login();const denied=axios.create({adapter:async config=>{throw new axios.AxiosError('Unauthorized','ERR_BAD_REQUEST',config,{}, {status:401,data:{},headers:{},config});}});
 installSessionInterceptors(denied,s,{refresh:async()=>{throw Error('offline');},onSignedOut:()=>redirects++});
 await assert.rejects(denied.get('/read'));assert.equal((await s.read()).accessToken,'A1','temporary refresh network failure preserves session and draft');
 let release;const waiting=new Promise(r=>release=r);const late=axios.create({adapter:async config=>{await waiting;throw new axios.AxiosError('Unauthorized','ERR_BAD_REQUEST',config,{}, {status:401,data:{},headers:{},config});}});
 installSessionInterceptors(late,s,{refresh:async()=>{throw Error('must not refresh old account');},onSignedOut:()=>redirects++});
 const request=late.post('/old-mutation').catch(()=>{});await new Promise(r=>setTimeout(r,0));await login(2);release();await request;assert.equal((await s.read()).accessToken,'A2');
 await login();let attempts=0;
 const repeated=axios.create({adapter:async config=>{throw new axios.AxiosError('Unauthorized','ERR_BAD_REQUEST',config,{}, {status:401,data:{},headers:{},config});}});
 installSessionInterceptors(repeated,s,{refresh:async()=>{attempts++;return {accessToken:'NEXT2',refreshToken:'RNEXT2'};},onSignedOut:()=>{}});
 await assert.rejects(repeated.get('/still-denied'));assert.equal(attempts,1);assert.equal((await s.read()).accessToken,null);
 console.log('PASS: concurrent GET refresh once, mutation no replay, transient refresh error, stale account 401, repeated 401 stops after one refresh');
})().catch(e=>{console.error(e);process.exitCode=1;});
