import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const fail = (msg) => {
  console.error("AUTHORITY_CONFORMANCE_FAIL:", msg);
  process.exitCode = 1;
};

const routers = read("server/routers.ts");
const email = read("server/emailMarketing.ts");
const storage = read("server/storage.ts");
const dataApi = read("server/_core/dataApi.ts");
const pages = read(".github/workflows/pages-fallback.yml");

if (routers.includes("await notifyOwner({")) {
  fail("direct owner notification bypass");
}
if (/syncLeadToLoops\(\s*input\./.test(routers)) {
  fail("lead Loops sync bypass");
}
if (/syncInquiryToLoops\(\s*input\./.test(routers)) {
  fail("inquiry Loops sync bypass");
}
if (!routers.includes("authorityFromDurableRecord")) {
  fail("durable request authority not bound at router");
}

if (!email.includes("requireAuthority(authority)")) {
  fail("Loops adapter does not require authority");
}
if (!email.includes("...authorityHeaders(identity)")) {
  fail("Loops adapter does not propagate authority receipt");
}

if (!/storagePut\(\s*authority:\s*AuthorityIdentity/.test(storage)) {
  fail("storagePut does not require authority");
}
if (!storage.includes("requireAuthority(authority)")) {
  fail("storagePut authority is not validated");
}

if (!dataApi.includes("mutationShaped")) {
  fail("Data API mutation boundary missing");
}
if (!dataApi.includes("requireAuthority(options.authority)")) {
  fail("mutation-shaped Data API calls do not fail closed");
}

if (!pages.includes("if: github.event_name == 'workflow_dispatch'")) {
  fail("Pages deployment is not dispatch-gated");
}
if (!pages.includes("DIRECT_HUMAN_WORKFLOW_DISPATCH")) {
  fail("Pages deployment authority receipt missing");
}

if (!process.exitCode) {
  console.log("PASS_AUTHORITY_CONFORMANCE");
}
