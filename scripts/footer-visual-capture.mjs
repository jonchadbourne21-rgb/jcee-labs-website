import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {findOpenPort, start, stop, waitForUrl, connect, navigate, sleep, removeProfileDirectory} from './browser-test-helpers.mjs';
const out=path.resolve('artifacts/enterprise-visual-review');
const port=await findOpenPort(), debug=await findOpenPort();
const profile=path.join(os.tmpdir(),`jcee-footer-${process.pid}`);
const server=start(process.execPath,['dist/index.js'],{env:{...process.env,NODE_ENV:'production',PORT:String(port)}});
const browser=start(process.env.CHROMIUM_BIN||'chromium',['--headless=new','--no-sandbox','--disable-gpu',`--remote-debugging-port=${debug}`,`--user-data-dir=${profile}`,'about:blank']);
let client; const rows=[];
try {
  await mkdir(out,{recursive:true});
  const base=`http://127.0.0.1:${port}`;
  await waitForUrl(base,'production footer server');
  client=await connect(debug);
  for(const route of ['/','/assurance']) for(const width of [1440,1280,768,390,320]) {
    await client.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<=390});
    await navigate(client.send,base,route);
    await client.send('Runtime.evaluate',{expression:`document.querySelector('.brand-footer').scrollIntoView({block:'start'});`});
    await sleep(200);
    const state=await client.send('Runtime.evaluate',{returnByValue:true,expression:`(() => {
      const f=document.querySelector('.brand-footer');
      const sel=x=>f.querySelector(x);
      const pos=x=>{const r=sel(x).getBoundingClientRect();return {top:r.top+scrollY,bottom:r.bottom+scrollY}};
      return {text:f.innerText,tag:sel('.brand-footer-wordmark').innerText,founder:sel('.footer-founder').innerText,founderHref:sel('.footer-founder').getAttribute('href'),links:[...sel('.brand-footer-links').querySelectorAll('a')].map(x=>x.getAttribute('href')),logo:[...f.querySelectorAll('img')].every(x=>x.complete&&x.naturalWidth>0),width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,top:pos('.brand-footer-wordmark'),nav:pos('.brand-footer-links'),identity:pos('.brand-footer-bottom-identity'),founderPos:pos('.footer-founder'),lockup:pos('.brand-footer-lockup'),meta:pos('.brand-footer-meta'),footerRect:((r)=>({x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height}))(f.getBoundingClientRect())};
    })()`});
    assert.ok(!state.exceptionDetails,'Footer DOM evaluation failed');
    const v=state.result.value;
    assert.equal(v.tag,'Intelligence That Leaves Receipts');
    assert.equal(v.founder,'Founded by Jonathan Matthew Chadbourne ↗');
    assert.equal(v.founderHref,'/founder');
    assert.equal(v.logo,true);
    assert.ok(!/PUBLIC SITE|We build for the distance|EVIDENCE OVER CLAIMS/i.test(v.text));
    assert.equal(v.links.length,19);
    assert.ok(v.top.bottom<=v.nav.top+1 && v.nav.bottom<=v.identity.top+1);
    assert.ok(v.lockup.bottom<=v.founderPos.top+1 && v.identity.bottom<=v.meta.top+1);
    assert.equal(v.scrollWidth,width); assert.equal(v.bodyWidth,width);
    const rect=v.footerRect;
    const ss=await client.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:true,clip:{...rect,scale:1}});
    const bytes=Buffer.from(ss.data,'base64');
    const name=`footer-${route==='/'?'home':'assurance'}-${width}.png`;
    await writeFile(path.join(out,name),bytes);
    rows.push({route,width,name,sha256:createHash('sha256').update(bytes).digest('hex'),pass:true});
  }
  assert.deepEqual(client.runtimeErrors,[]); assert.deepEqual(client.networkFailures,[]);
  await writeFile(path.join(out,'footer-manifest.json'),JSON.stringify({cases:rows,pass:true,commit:process.env.GITHUB_SHA||null},null,2));
  console.log('Footer visual PASS: '+rows.length+' cases');
} finally {client?.close();await stop(browser.child);await stop(server.child);await removeProfileDirectory(profile);}
