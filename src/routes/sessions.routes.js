import express from 'express';
import HttpErrors from 'http-errors';


import explorateurRepository from "../repositories/explorateur.repository.js"

const router = express.Router();

router.post('/', login);

async function login(req, res, next) {
    try {
        const { credential, password } = req.body;
        let account = await explorateurRepository.login(credential, password);
        if (!account) {
            throw new HttpErrors.Unauthorized('Identifiants invalides');
        }

        const tokens = explorateurRepository.generateJWT(account.uuid);

        account = account.toObject({ getters: false, virtuals: false });
        account = explorateurRepository.transform(account);

        res.status(201).json({ account, tokens });
    } catch (err) {
        return next(err);
    }
}

export default router;
