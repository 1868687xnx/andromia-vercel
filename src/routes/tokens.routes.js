import express from 'express';
import { guardRefreshTokenJWT } from '../middlewares/authorization.jwt.js';
import explorateurRepository from '../repositories/explorateur.repository.js';


const router = express.Router();

router.post('/', guardRefreshTokenJWT, refresh);

async function refresh(req, res, next) {

    try {
        const tokens = explorateurRepository.generateJWT(req.refresh.uuid);
        res.status(201).json(tokens);
    } catch (err) {
        return next(err);
    }
}


export default router;
