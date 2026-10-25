import https from "node:https";
import tls from "node:tls";
import fs from "node:fs";
import crypto from "node:crypto";
const out="verification-evidence";
fs.mkdirSync(out,{recursive:true});
const observation={schema:"jcee.diagnostic-node-trust/1.0",observedAt:new Date().toISOString(),context:"Separate GitHub Actions diagnostic process, not the live application or its CA store",intendedRelease:"a7260237836ebb27c00c58396020639358d01b39",node:process.version,openssl:process.versions.openssl,execArgv:process.execArgv,environmentVariablePresence:Object.fromEntries(["NODE_OPTIONS","NODE_EXTRA_CA_CERTS","NODE_TLS_REJECT_UNAUTHORIZED","SSL_CERT_FILE","SSL_CERT_DIR"].map(k=>[k,Object.hasOwn(process.env,k)])),stores:{},requests:[]};
const digest=x=>crypto.createHash("sha256").update(x).digest("hex");
for(const kind of ["default","bundled","system","extra"]){
 try{
  const certs=typeof tls.getCACertificates==="function"?tls.getCACertificates(kind):(kind==="bundled"?tls.rootCertificates:null);
  observation.stores[kind]=certs?{count:certs.length,sha256:digest(certs.join("\n"))}:{unavailable:true};
 }catch(e){observation.stores[kind]={error:e.message};}
}
async function probe(url){
 return await new Promise(resolve=>{
  const r=https.get(url,{timeout:15000,headers:{"User-Agent":"JCEE-Authorized-Certificate-Verification/1.0"}},res=>{
   const value={url,tlsAccepted:true,status:res.statusCode,authorized:res.socket.authorized,remoteAddress:res.socket.remoteAddress};
   res.resume();resolve(value);
  });
  r.on("timeout",()=>r.destroy(Object.assign(new Error("Request timed out"),{code:"TIMEOUT"})));
  r.on("error",e=>resolve({url,tlsAccepted:false,errorCode:e.code,error:e.message}));
 });
}
for(const url of ["https://nodejs.org/","https://jceelabs.com/","https://dv-g3b-emudhra.we-have-a-problem.com/","https://dv-g3b-aaa-emudhra.we-have-a-problem.com/"])observation.requests.push(await probe(url));
const certificateCodes=new Set(["CERT_REVOKED","CERT_SIGNATURE_FAILURE","UNABLE_TO_VERIFY_LEAF_SIGNATURE","UNABLE_TO_GET_ISSUER_CERT","UNABLE_TO_GET_ISSUER_CERT_LOCALLY","CERT_UNTRUSTED","SELF_SIGNED_CERT_IN_CHAIN","DEPTH_ZERO_SELF_SIGNED_CERT","ERR_TLS_CERT_ALTNAME_INVALID","CERT_HAS_EXPIRED"]);
observation.controlPassed=observation.requests[0].tlsAccepted===true;
observation.advisoryEndpoints=observation.requests.slice(2).map(r=>({...r,classification:r.tlsAccepted?"TRUST_ACCEPTED_REMEDIATION_REQUIRED":certificateCodes.has(r.errorCode)?"CERTIFICATE_REJECTED":"INCONCLUSIVE_NETWORK_OR_OTHER_ERROR"}));
observation.claimLimit="These observations apply only to this diagnostic Node process. Production HTTP clients and custom stores require their own verification.";
fs.writeFileSync(out+"/node-trust-observations.json",JSON.stringify(observation,null,2)+"\n");
console.log(JSON.stringify(observation,null,2));
if(process.version!=="v22.23.4")process.exitCode=1;
