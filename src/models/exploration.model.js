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
            elements: { type: [{symbol: String, quantity: Number}]}
<<<<<<< HEAD

=======
            //elements: { type: [ElementSchema] }
>>>>>>> eabf490dc4131570a3e6d7b1ce854bdf87629b19
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

