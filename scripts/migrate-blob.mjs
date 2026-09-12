import { list, put } from '@vercel/blob';

const OLD_TOKEN = process.env.OLD_BLOB_TOKEN;
const NEW_TOKEN = process.env.NEW_BLOB_TOKEN;

if (!OLD_TOKEN || !NEW_TOKEN) {
  console.error('Missing OLD_BLOB_TOKEN or NEW_BLOB_TOKEN env vars');
  process.exit(1);
}

async function listAll() {
  const all = [];
  let cursor;
  do {
    const res = await list({ token: OLD_TOKEN, cursor, limit: 1000 });
    all.push(...res.blobs);
    cursor = res.cursor;
  } while (cursor);
  return all;
}

async function main() {
  const blobs = await listAll();
  console.log(`Found ${blobs.length} blobs in old store`);

  let ok = 0;
  let fail = 0;
  const mapping = [];

  for (const blob of blobs) {
    try {
      const res = await fetch(blob.url);
      if (!res.ok) throw new Error(`fetch failed ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());

      const uploaded = await put(blob.pathname, buf, {
        access: 'public',
        token: NEW_TOKEN,
        contentType: blob.contentType,
        addRandomSuffix: false,
      });

      mapping.push({ old: blob.url, new: uploaded.url, pathname: blob.pathname });
      ok++;
      if (ok % 10 === 0) console.log(`  ...${ok} done`);
    } catch (err) {
      console.error(`FAILED ${blob.pathname}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone. OK: ${ok}, FAILED: ${fail}`);
  console.log('MAPPING_JSON_START');
  console.log(JSON.stringify(mapping));
  console.log('MAPPING_JSON_END');
}

main();
