import mongoose from 'mongoose';

const revokedToken = mongoose.Schema(
    {
        token: { type: String, required: true, unique: true },
    },
    { collection: 'revoked-tokens', strict: 'throw', timeStamp: true }
);

const RevokedToken = mongoose.model('RevokedToken', revokedToken);

export { RevokedToken };