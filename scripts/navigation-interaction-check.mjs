import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { findOpenPort, start, stop, waitForUrl, connect, navigate, evaluate, sleep, removeProfileDirectory } from './browser-test-helpers.mjs';

const port=await findOpenPort(), debug=await findOpenPort();
const base=`http://127.0.0.1:${port}`;
const profile=path.join(os.tmpdir(),`worldlab-navigation-${process.pid}`);
const server=start(process.execPath,['dist/index.js'],{env:{...process.env,PORT:String(port),NODE_ENV:'production'}});
const browser=start(process.env.CHROMIUM_BIN||'chromium',['--headless=new','--no-sandbox','--disable-gpu',`--remote-debugging-port=${debug}`,`--user-data-dir=${profile}`,'about:blank']);
const links=['/capabilities/infrastructure','/technology','/research','/resources','/company'];
let client;const cases=[];
try {
 await waitForUrl(base,'navigation test server');client=await connect(debug);const {send}=client;
 async function activate(selector,touch=false,blur=false) {
  const point=await evaluate(send,`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing control');const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  if(touch){
   await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,radiusX:2,radiusY:2,force:1,id:1}]});
   // A touch browser can focus the document between pointerdown and activation.
   // The old onBlur handler removed the link at this point, before touchend/click.
   if(blur){await evaluate(send,'document.activeElement?.blur()');assert.equal(await evaluate(send,"document.querySelector('.mobile-menu-toggle').getAttribute('aria-expanded')"),'true','Touch focus loss must not remove the link');}
   await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  } else {
   await send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});
   await send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});
  }
 }
 async function arrived(route) {
  for(let i=0;i<80;i++){
   if(await evaluate(send,`location.pathname===${JSON.stringify(route)}&&document.querySelector('#root')?.dataset.clientReady==='true'&&!!document.querySelector('h1')`))return;
   await sleep(75);
  }
  assert.fail(`Link did not reach ${route}`);
 }
 for(const width of [320,390,768,1024]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  for(const href of links){
   await navigate(send,base,'/');await activate('.mobile-menu-toggle',true);
   await activate(`.mobile-nav a[href="${href}"]`,true,true);await arrived(href);
   assert.equal(await evaluate(send,"document.querySelector('.mobile-menu-toggle').getAttribute('aria-expanded')"),'false');
   assert(await evaluate(send,'document.documentElement.scrollWidth<=innerWidth+1'));
   cases.push({width,href,input:'touch with null-related-target blur',pass:true});
  }
  await navigate(send,base,'/company');await activate('.mobile-menu-toggle',true);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  assert(await evaluate(send,"document.activeElement.matches('.mobile-menu-toggle')&&document.activeElement.getAttribute('aria-expanded')==='false'"));
  await activate('.mobile-menu-toggle',true);await activate('.header-contact',true);await arrived('/consultation');
  cases.push({width,href:'/consultation',input:'outside tap while menu open',pass:true});
 }
 await send('Emulation.setTouchEmulationEnabled',{enabled:false});
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 for(const href of links){
  await navigate(send,base,'/');
  if(['/company','/resources'].includes(href))await activate('.header-company-menu summary');
  await activate(`.desktop-nav a[href="${href}"]`);await arrived(href);cases.push({width:1440,href,input:'mouse',pass:true});
 }
 await navigate(send,base,'/technology');await activate('.wordmark');await arrived('/');
 await activate('.header-contact');await arrived('/consultation');
 // Native anchors remain keyboard-operable, even after a focus excursion.
 await navigate(send,base,'/');await evaluate(send,"document.querySelector('.desktop-nav a[href=\"/technology\"]').focus()");
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await arrived('/technology');
 cases.push({width:1440,href:'/technology',input:'keyboard Enter',pass:true});
 assert.deepEqual(client.runtimeErrors,[]);assert.deepEqual(client.networkFailures,[]);
 await mkdir('artifacts/navigation',{recursive:true});await writeFile('artifacts/navigation/result.json',JSON.stringify({cases,logoHome:true,desktopContact:true,escapeFocusRestored:true,runtimeErrors:client.runtimeErrors,networkFailures:client.networkFailures},null,2));
 console.log(`Navigation PASS: ${cases.length} route activations plus home, contact and Escape focus checks.`);
} finally {client?.close();await stop(browser.child);await stop(server.child);await removeProfileDirectory(profile);}
