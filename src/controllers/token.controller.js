import tokenRepository from '../repositories/token.repository.js';
import HttpErrors from 'http-errors'

export default class TokenController {
    async isRevoked(token) {}

    async invalidate(token) {
        try {
            const revokedToken = await tokenRepository.invalidate(token);
            if (!revokedToken) {
                throw HttpErrors.Unauthorized();
            }
        } catch (err) {
            throw err;
        }
    }
}
