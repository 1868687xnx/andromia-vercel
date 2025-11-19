import express from 'express';
import HttpErrors from 'http-errors';
import allyRepository from '../repositories/ally.repository.js';


import explorateurRepository from '../repositories/explorateur.repository.js';
import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';

const router = express.Router();


router.get('/:uuid/allies', guardAuthorizationJWT, retrieveAlliesByUUID);
router.get('/:uuid/allies/:uuidAlly', guardAuthorizationJWT, retrieveOneAlly);
router.patch('/:uuid', guardAuthorizationJWT, addAlly);


async function addAlly(req, res, next) {
    try {
        let explorateur = await explorateurRepository.retrieveByUUID(req.auth.uuid);
        console.log("Explorateur dans allies.routes.js :", req.auth.uuid);
        let newAlly = await allyRepository.createForOneUser(req.params.uuid, explorateur._id);

        if (req.query._body === 'false') {
            return res.status(204).end();
        }
        newAlly = newAlly.toObject({ getters: false, virtuals: false });
        res.status(201).json(newAlly);
    } catch (err) {
        return next(err);
    }
}

// Route pour récupérer les Allies d'un explorateur spécifique par son UUID
async function retrieveAlliesByUUID(req, res, next) {
    try {
        const explorateur = await explorateurRepository.retrieveByUUID(req.params.uuid);
        if (!explorateur) {
            return next(HttpErrors.NotFound("Aucun explorateur trouvé avec cet UUID"));
        }

        let allies = await allyRepository.retrieveForOneUser(explorateur._id);

        allies = allies.map(a => {
            a = a.toObject({ getters: false, virtuals: false });
            a = allyRepository.transform(a, req.options);
            return a;
        });

        res.status(200).json(allies);
    } catch (err) {
        return next(err);
    }
}


// Route pour récupérer un ally spécifique d'un explorateur par son UUID
async function retrieveOneAlly(req, res, next) {
    try {
        const explorateur = await explorateurRepository.retrieveByUUID(req.params.uuid);
        if (!explorateur) {
            return next(HttpErrors.NotFound("Aucun explorateur trouvé avec cet UUID"));
        }

        let ally = await allyRepository.retrieveByUUID(req.params.allyUUID);
        if (!ally) {
            return next(HttpErrors.NotFound("Aucun ally trouvé avec cet UUID"));
        }

        res.status(200).json(ally);
    } catch (err) {
        return next(err);
    }
}

export default router;


