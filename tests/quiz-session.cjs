const assert=require('node:assert/strict');const ts=require('typescript');const path=require('node:path');const fs=require('node:fs');const Module=require('node:module');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);
const rows=new Map();const raw={getItem:async k=>rows.get(k)??null,setItem:async(k,v)=>rows.set(k,v),removeItem:async k=>rows.delete(k),multiRemove:async ks=>ks.forEach(k=>rows.delete(k))};
let fail=true;
const load=Module._load;Module._load=function(name,parent,main){
 if(name==='@react-native-async-storage/async-storage')return raw;
 if(name==='@/services/quizz')return {submitSessionId:async()=>{if(fail)throw Error('offline');return {attemptId:9,score:{R:1}};}};
 if(name.startsWith('@/'))name=path.resolve(__dirname,'../src',name.slice(2));
 return load.call(this,name,parent,main);
};
(async()=>{
 const {authSession}=require('../src/helpers/authSession.ts');const {useQuizStore}=require('../src/store/ExamStore.ts');
 const login=id=>authSession.establish({accessToken:`A${id}`,refreshToken:`R${id}`,user:{id,fullname:'Test'}});
 await login(1);useQuizStore.setState({sessionId:'9',questions:[{title:'A',answer:[{id:'1',content:'Question A'}]}],answers:{1:true},currentQuestionIndex:0});
 await new Promise(r=>setTimeout(r,0));const draft=rows.get('huong-nghiep-quiz:1');
 await assert.rejects(useQuizStore.getState().submitSession());assert.equal(useQuizStore.getState().sessionId,'9');assert.deepEqual(useQuizStore.getState().answers,{1:true});
 await authSession.clear();assert.equal(useQuizStore.getState().sessionId,null);assert.equal(rows.get('huong-nghiep-quiz:1'),draft);
 await login(2);assert.equal(useQuizStore.getState().questions.length,0);
 await login(1);assert.equal(useQuizStore.getState().sessionId,'9');assert.deepEqual(useQuizStore.getState().answers,{1:true});
 fail=false;await useQuizStore.getState().submitSession();assert.equal(useQuizStore.getState().sessionId,null);
 console.log('PASS real Zustand quiz store: failed mutation retains draft, logout clears memory, B isolation, A resume, success resets');
})().catch(e=>{console.error(e);process.exitCode=1;});
