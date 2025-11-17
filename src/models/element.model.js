import mongoose from 'mongoose';

const ElementSchema = new mongoose.Schema({
    symbol: { type: String, default: '' },
    quantity: { type: Number, default: 0 }
}, { _id: false });

export { ElementSchema };
