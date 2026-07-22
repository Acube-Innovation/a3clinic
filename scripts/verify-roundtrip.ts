/**
 * Write→read round-trip through the real repository code path (the same one the
 * admin uses via store.ts → mysql.ts → db/index.ts). Mutates, verifies, restores.
 * Usage: node --env-file=.env.local scripts/verify-roundtrip.ts
 */
import { dbReadDoc, dbWriteDoc } from "../src/lib/admin/db/index.ts";
import { getPool } from "../src/lib/admin/db/pool.ts";

let failures = 0;
const ok = (name: string, cond: boolean, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
  if (!cond) failures++;
};

// -------- collection round-trip: conditions --------
const conditions = (await dbReadDoc("conditions")) as any[];
ok("conditions read count", conditions.length === 46, `${conditions.length}`);
const hf = conditions.find((c) => c.slug === "hair-fall");
ok("hair-fall present w/ nested arrays",
  !!hf && Array.isArray(hf.faqs) && Array.isArray(hf.symptoms) && Array.isArray(hf.expectedResults));

const origFaqCount = hf.faqs.length;
const origFirstCondSlug = conditions[0].slug; // ordering marker
hf.faqs.push({ question: "ROUNDTRIP_Q", answer: "ROUNDTRIP_A" });
await dbWriteDoc("conditions", conditions);

const after = (await dbReadDoc("conditions")) as any[];
const hf2 = after.find((c) => c.slug === "hair-fall");
ok("faq appended + persisted", hf2.faqs.length === origFaqCount + 1);
ok("appended faq at correct tail position",
  hf2.faqs[hf2.faqs.length - 1].question === "ROUNDTRIP_Q");
ok("collection order preserved", after[0].slug === origFirstCondSlug);
ok("other conditions untouched", after.length === 46);
ok("sibling nested data intact (symptoms)",
  JSON.stringify(hf2.symptoms) === JSON.stringify(hf.symptoms));

// restore
hf.faqs.pop();
await dbWriteDoc("conditions", conditions);
const restored = (await dbReadDoc("conditions")) as any[];
ok("condition restored",
  restored.find((c) => c.slug === "hair-fall").faqs.length === origFaqCount);

// -------- singleton round-trip: clinic (nested children) --------
const clinic = (await dbReadDoc("clinic")) as any;
const origPhone = clinic.phone;
const origHours = JSON.stringify(clinic.hours);
clinic.phone = "0000000000";
await dbWriteDoc("clinic", clinic);
const clinic2 = (await dbReadDoc("clinic")) as any;
ok("clinic scalar updated", clinic2.phone === "0000000000");
ok("clinic child list (hours) preserved through write", JSON.stringify(clinic2.hours) === origHours);
clinic.phone = origPhone;
await dbWriteDoc("clinic", clinic);
ok("clinic restored", ((await dbReadDoc("clinic")) as any).phone === origPhone);

// -------- nested singleton shape: doctor --------
const doctor = (await dbReadDoc("doctor")) as any;
ok("doctor nested shape intact",
  !!doctor.biography?.paragraphs && !!doctor.mission?.values && Array.isArray(doctor.timeline));

// -------- uninitialized section falls back to defaults --------
const posts = await dbReadDoc("posts");
ok("posts uninitialized → undefined (defaults apply)", posts === undefined);

await (await getPool()).end();
console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
