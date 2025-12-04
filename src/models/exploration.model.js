import mongoose from 'mongoose';
import { type } from 'os';
import { ElementSchema } from './element.model.js';

const explorationSchema = mongoose.Schema(
    {
        explorateur: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Explorateur'
        },
        explorationDate: {  
            type: Date,
            required: true,
            default: Date.now
        },
        destination: { type: String, required: true},
        affinity: { type: String, required: true },
        vault: {
            inox: { type: Number, default: 0 },
            elements: { type: [{element: String, quantity: Number}]}
            //elements: { type: [ElementSchema] }
        },
        ally: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ally', 
            required: false
        },
        uuid: { type: String, required: true, unique: true, default: () => crypto.randomUUID() }
    },
    {
        collection: 'explorations',
        strict: 'throw',
        timestamps: true
    }
);

const Exploration = mongoose.model('Explorations', explorationSchema);

export { Exploration };

