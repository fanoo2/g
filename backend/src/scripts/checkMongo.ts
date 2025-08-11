import mongoose from 'mongoose';
import { config } from '../config.js';
import { User, Gift } from '../models.js';

async function main() {
  const uri = config.mongoUrl;
  const start = Date.now();
  try {
    await mongoose.connect(uri);
  if (!mongoose.connection.db) throw new Error('No db handle after connect');
  await mongoose.connection.db.admin().command({ ping: 1 });
    const [users, gifts] = await Promise.all([
      User.countDocuments().catch(()=>0),
      Gift.countDocuments().catch(()=>0)
    ]);
    console.log(JSON.stringify({ ok: true, ms: Date.now()-start, uriRedacted: uri.replace(/:\/\/.*@/, '://<credentials>@'), counts: { users, gifts } }));
  } catch (e:any) {
    console.error(JSON.stringify({ ok: false, error: e.message }));
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(()=>{});
  }
}

main();
