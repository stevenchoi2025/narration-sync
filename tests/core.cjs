const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const script=src.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',classList:{toggle(){}},style:{}});return nodes.get(id);};
const c={document:{getElementById:node,querySelectorAll:()=>[],documentElement:{dataset:{}}},window:{},localStorage:{getItem(){},setItem(){}},addEventListener(){},matchMedia:()=>({matches:false}),console,Blob,URL,setTimeout};
vm.createContext(c);vm.runInContext(script.replace('window.__nsBuild=buildOutput;', 'window.__test={parseHTML,detectRaw,groupRaw,problems,engineTiming,flatPlan,assignment,showHtmlInfo};window.__nsBuild=buildOutput;'),c);
const api=c.window.__test,S=c.window.__nsState;
const flat='<!doctype html><html><body><script>const tl=gsap.timeline({paused:true});const SUBS=[[0.2,1,"你好"],[1.6,2.5,"再見"]];tl.to({}, {duration:1},0.2);</script></body></html>';
const engine='<!doctype html><html><body><script>const TIMING={};const USE_TIMING=false;const AUDIO={offset:0.3};registerScene({id:1,title:"甲",duration:3,subs:[[0.2,"你好"],[1.6,"再見"]],build(){}});registerScene({id:2,title:"乙",duration:3,subs:[[0.2,"你好"],[1.6,"再見"]],build(){}});</script></body></html>';
function load(text){S.html=text;S.htmlName='fixture.html';S.parse=api.parseHTML(text);assert.equal(S.parse.errors.length,0);}
const file=()=>({name:'01.wav',dur:3,env:Float32Array.from({length:300},(_,i)=>(i>=20&&i<100)||(i>=160&&i<250)?-10:-90),dataURL:'data:audio/wav;base64,UklGRg==',n:2,groups:[[.2,1],[1.6,2.5]]});
function syntax(out){let count=0;for(const m of out.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)){new vm.Script(m[1]);count++;}assert(count>0);}
load(flat);assert.equal(S.parse.nSubs,2);S.files=[file()];assert.equal(api.detectRaw(S.files[0]).length,2);assert.equal(api.groupRaw(api.detectRaw(S.files[0]),2).length,2);assert.equal(api.problems().length,0);syntax(c.window.__nsBuild());
S.files[0].groups=[[.2,2],[1.6,2.5]];assert(api.problems().some(x=>x.includes('重疊')));
load(engine);assert.equal(S.parse.scenes.length,2);assert.equal(S.parse.nSubs,4);S.files=[file(),{...file(),name:'02.wav'}];assert.equal(api.problems().length,0);let out=c.window.__nsBuild();syntax(out);assert(out.includes('USE_TIMING=true'));assert(out.includes('window.EMBEDDED_AUDIO'));
S.files[0].groups=[];assert(api.problems().some(x=>x.includes('有效聲音')));
S.parse=api.parseHTML('<html><script>registerScene({})</script></html>');assert(S.parse.errors.length>0);api.showHtmlInfo();
console.log('PASS: source syntax; flat/engine parsing; two-segment silence detection; grouping; overlap and silence validation; flat and two-scene generated JavaScript syntax; embedded audio; invalid engine input error rendering.');
