import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
    handle: { type: String, unique: true, required: true },
    password: { type: String },
    tokens: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    roles: { type: [String], default: ['viewer'] }
}, { timestamps: true });
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
const GiftSchema = new mongoose.Schema({
    code: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    tokenCost: { type: Number, required: true },
    animationKey: String,
    commandAction: String
});
export const Gift = mongoose.models.Gift || mongoose.model('Gift', GiftSchema);
const GiftEventSchema = new mongoose.Schema({
    giftCode: String,
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    streamId: String,
    tokens: Number,
    commandAction: String
}, { timestamps: { createdAt: true, updatedAt: false } });
export const GiftEvent = mongoose.models.GiftEvent || mongoose.model('GiftEvent', GiftEventSchema);
