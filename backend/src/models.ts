import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  handle: string;
  password?: string;
  tokens: number;
  xp: number;
  level: number;
  roles: string[];
}

const UserSchema = new mongoose.Schema<IUser>({
  handle: { type: String, unique: true, required: true },
  password: { type: String },
  tokens: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  roles: { type: [String], default: ['viewer'] }
},{ timestamps: true });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export interface IGift extends mongoose.Document {
  code: string;
  name: string;
  tokenCost: number;
  animationKey?: string;
  commandAction?: string;
}

const GiftSchema = new mongoose.Schema<IGift>({
  code: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  tokenCost: { type: Number, required: true },
  animationKey: String,
  commandAction: String
});

export const Gift = mongoose.models.Gift || mongoose.model<IGift>('Gift', GiftSchema);

export interface IGiftEvent extends mongoose.Document {
  giftCode: string;
  fromUser: mongoose.Types.ObjectId;
  streamId?: string;
  tokens: number;
  commandAction?: string;
}

const GiftEventSchema = new mongoose.Schema<IGiftEvent>({
  giftCode: String,
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  streamId: String,
  tokens: Number,
  commandAction: String
},{ timestamps: { createdAt: true, updatedAt: false } });

export const GiftEvent = mongoose.models.GiftEvent || mongoose.model<IGiftEvent>('GiftEvent', GiftEventSchema);
