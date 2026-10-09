require('./register-typescript.cjs');const assert=require('node:assert/strict');
const {updateSocketAuth}=require('../src/helpers/socketAuth.ts');
const sent=[];const socket={connected:true,auth:{token:'old'},emit:(...args)=>sent.push(args)};
updateSocketAuth(socket,'fresh');assert.equal(socket.auth.token,'fresh');assert.deepEqual(sent,[['refresh_auth',{token:'fresh'}]]);
socket.connected=false;updateSocketAuth(socket,'newer');assert.equal(socket.auth.token,'newer');assert.equal(sent.length,1);
console.log('PASS: socket auth renewal event and reconnect credentials');
