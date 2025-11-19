import express from 'express';
import HttpErrors from 'http-errors';
import validator from './../middlewares/validator.js';
import explorateurRepository from "../repositories/explorateur.repository.js"
import allyRepository from '../repositories/ally.repository.js';
import explorateurValidators from '../validators/explorateur.validator.js';
import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';

const router = express.Router();

router.post('/', explorateurValidators.postValidator(), validator, post);
router.get('/:uuid', guardAuthorizationJWT, retrieveOne);
router.get('/:uuid/vault', guardAuthorizationJWT, retrieveVault);
router.get('/:uuid/allies', guardAuthorizationJWT, retrieveAlliesByUUID);
router.get('/:uuid/allies/:uuidAlly', guardAuthorizationJWT, retrieveOneAlly);
router.patch('/:uuid', guardAuthorizationJWT, addAlly);

async function post(req, res, next) {
    try {
        let account = await explorateurRepository.create(req.body);
        const tokens = explorateurRepository.generateJWT(account.uuid);
        account = account.toObject({ getters: false, virtuals: false });
        account = explorateurRepository.transform(account);
        res.status(201).json({ account, tokens });
    } catch (err) {
        return next(err);
    }
}

async function retrieveOne(req, res, next) {
    try {
        let account = await explorateurRepository.retrieveByUUID(req.params.uuid);
        if (!account) {
            return next(HttpErrors.NotFound());
        } else {
            account = account.toObject({ getters: false, virtuals: false });
            account = explorateurRepository.transform(account);
            res.status(200).json(account);
        }
    } catch (err) {
        return next(err);
    }
}

// Route pour retrieve le vault d'un explorateur
async function retrieveVault(req, res, next) {
    try {
        let account = await explorateurRepository.retrieveByUUID(req.params.uuid);
        if (!account) {
            return next(HttpErrors.NotFound());
        } else {
            // on retourne le vault de l'explorateur
            const vault = account.inventory.vault;
            res.status(200).json(vault);
        }
    } catch (err) {
        return next(err);
    }
}

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
