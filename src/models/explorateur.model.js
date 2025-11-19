import mongoose from 'mongoose';
import crypto from 'crypto';
import { ElementSchema } from './element.model.js';

import TABLE_ELEMENT from '../core/constants.js';

const explorateurSchema = mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        uuid: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
        passwordHash: { type: String, required: true, unique: true },

        location: { type: String, default: 'Lac de Meth' },
        nbLootboxes: { type: Number, default: 0 },
        // l'inventory contient les items ramassés par l'explorateur, soit des inox, soit des éléments divers
        inventory: {
            vault: {
                inox: { type: Number, default: 0 },
                elements: { type: [ElementSchema], default: TABLE_ELEMENT.slice()}
            }
        }
    },
    {
        collection: 'explorateurs',
        strict: 'throw',
        timestamps: true
    }
);

const Explorateur = mongoose.model('Explorateur', explorateurSchema);

export { Explorateur };

// On met en virtuel la relation avec les Allies
explorateurSchema.virtual('allies', {
    ref: 'Ally',
    localField: '_id',
    foreignField: 'explorateur'
});

// Juste pour être sûr que les virtuals sont inclus lors de la conversion en objet
explorateurSchema.set('toObject', { virtuals: true });
