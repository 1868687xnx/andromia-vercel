import { RevokedToken } from '../models/token.model.js';

class TokenRepository {
    findOne(token) {
        return RevokedToken.findOne({ token });
    }

    invalidate(token) {
        return RevokedToken.create({ token });
    }

    async isRevoked(token) {
        try {
            const tokenInDB = await RevokedToken.findOne({ token });

            if (!tokenInDB){
                return false;
            }
            return true;
        } catch (err) {
            throw err;
        }
    }
}

export default new TokenRepository();
