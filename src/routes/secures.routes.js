import express from 'express';
import HttpErrors from 'http-errors';

import accountRepository from '../repositories/account.repository.js';

import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';

const router = express.Router();

router.get('/', guardAuthorizationJWT, secure);
router.get('/:base64', retrieveOneSecure);

async function retrieveOneSecure(req, res, next) {
    try {
       //TODO:
    } catch (err) {
        return next(err);
    }
}

async function secure(req, res, next) {
    const secret = 'SuperSecret';

    console.log(req.auth);
    try {
        res.status(200).json({secret})
    } catch (err) {
        return next(err);
    }
}

export default router;
