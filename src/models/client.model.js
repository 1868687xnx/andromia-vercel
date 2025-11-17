import mongoose from 'mongoose';

const clientSchema = mongoose.Schema(
    {
        clientId: { type: String, required: true, unique: true },
        clientSecret: { type: String, require: true },
    },
    {
        collection: 'clients',
        strict: 'throw',
        timestamps: true
    }
);

const Client = mongoose.model('Client', clientSchema);

export { Client };
