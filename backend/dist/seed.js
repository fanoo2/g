import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { Gift, User, GiftEvent } from './models.js';
import { giftData, userSeedData } from './seeds/data.js';
async function seed() {
    await mongoose.connect(config.mongoUrl);
    console.log('[seed] Mongo connected');
    for (const g of giftData) {
        await Gift.updateOne({ code: g.code }, { $set: g }, { upsert: true });
    }
    console.log(`[seed] Upserted ${giftData.length} gifts`);
    for (const u of userSeedData) {
        const existing = await User.findOne({ handle: u.handle });
        if (existing)
            continue;
        const hash = await bcrypt.hash(u.password, 10);
        await User.create({ handle: u.handle, password: hash, tokens: u.tokens, roles: u.roles });
    }
    console.log('[seed] Ensured demo users (alice, bob, streamer)');
    // Create a visible sample gift event marker if none exist so the collection shows up immediately
    const giftEventCount = await GiftEvent.countDocuments();
    if (giftEventCount === 0) {
        const sampleUser = await User.findOne();
        const sampleGift = await Gift.findOne();
        if (sampleUser && sampleGift) {
            await GiftEvent.create({ giftCode: sampleGift.code, fromUser: sampleUser._id, tokens: sampleGift.tokenCost });
            console.log('[seed] Added sample GiftEvent so collection is visible');
        }
    }
    await mongoose.disconnect();
    console.log('[seed] Done');
}
seed().catch(e => { console.error(e); process.exit(1); });
