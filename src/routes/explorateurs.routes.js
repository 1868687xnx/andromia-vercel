import express from 'express';
import HttpErrors from 'http-errors';
import validator from './../middlewares/validator.js';
import explorateurRepository from "../repositories/explorateur.repository.js"
import explorateurValidators from '../validators/explorateur.validator.js';
import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';

const router = express.Router();

router.post('/', explorateurValidators.postValidator(), validator, post);
router.get('/:uuid', guardAuthorizationJWT, retrieveOne);
router.get('/:uuid/vault', guardAuthorizationJWT, retrieveVault);

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

export default router;
