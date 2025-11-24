import jwt from 'jsonwebtoken';
import HttpErrors from 'http-errors';
import argon from 'argon2';
import parseDuration from 'parse-duration';

import { Explorateur } from '../models/explorateur.model.js';

class ExplorateurRepository {
    async login(credential, password) {
        const explorateur = await this.retrieveByCredentials(credential);
        console.log(explorateur);
        if (!explorateur) {
            throw HttpErrors.Unauthorized();
        }

        if (!(await this.validatePassword(password, explorateur))) {
            throw HttpErrors.Unauthorized();
        }

        return explorateur;
    }

    async validatePassword(password, explorateur) {
        return await argon.verify(explorateur.passwordHash, password);
    }

    async create(explorateur) {
        try {
            explorateur.passwordHash = await argon.hash(explorateur.password);
            delete explorateur.password;
            return Explorateur.create(explorateur);
        } catch (err) {
            throw err;
        }
    }

    retrieveByUUID(uuid) {
        const retrieveQuery = Explorateur.findOne({ uuid: uuid });
        return retrieveQuery;
    }

    retrieveById(idAccount) {
        return Explorateur.findById(idAccount);
    }

    retrieveByEmail(email) {
        return Explorateur.findOne({ email: email });
    }

    retrieveByCredentials(credential) {
        return Explorateur.findOne({ $or: [{ email: credential }, { username: credential }] });
    }

    generateJWT(uuid) {
        const access = jwt.sign
        (
            {
                uuid: uuid
            }, 
            process.env.JWT_TOKEN_SECRET, 
            {
                expiresIn: process.env.JWT_TOKEN_LIFE, 
                issuer: process.env.BASE_URL
            }
        );
        const refresh = jwt.sign({ uuid },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: process.env.JWT_REFRESH_LIFE,
                issuer: process.env.BASE_URL
            }
        );
        const expiresIn = parseDuration(process.env.JWT_TOKEN_LIFE);

        return { access, refresh, expiresIn };
    }

    // Pour valider le refresh token lors du rafraichissement des tokens

    // async validateRefreshToken(email, headerBase64) {
    //     const explorateur = await this.retrieveByEmail(email);
    //     if (!explorateur) {
    //         throw HttpErrors.Unauthorized();
    //     }

    //     const refreshToken = Buffer.from(headerBase64, 'base64').toString('utf-8');
    //     if (refreshToken !== explorateur.refreshToken) {
    //         throw HttpErrors.Unauthorized();
    //     }

    //     return explorateur;
    // }

    transform(explorateur) {
        explorateur.href = `${process.env.BASE_URL}/explorateurs/${explorateur.uuid}`;

        delete explorateur._id;
        delete explorateur.__v;
        delete explorateur.password;
        delete explorateur.passwordHash;

        return explorateur;
    }

    // Méthode pour ouvrir une lootbox
    async openLootbox(explorateur, TABLE_ELEMENT) {
        // Vérifier que l'explorateur a des lootboxes
        if (explorateur.nbLootboxes <= 0) {
            throw HttpErrors.BadRequest("L'explorateur n'a pas de lootbox à ouvrir");
        }

        // Décrémenter le nombre de lootbox
        explorateur.nbLootboxes -= 1;

        // Ajouter un nombre d'inox aléatoire entre 10 et 30
        const inoxToAdd = Math.floor(Math.random() * 21) + 10;
        explorateur.inventory.vault.inox += inoxToAdd;

        // Ajouter entre 1 et 5 pour chaque élément
        const elementsAdded = [];
        TABLE_ELEMENT.forEach((element, index) => {
            const quantityToAdd = Math.floor(Math.random() * 5) + 1;
            explorateur.inventory.vault.elements[index].quantity += quantityToAdd;
            elementsAdded.push({
                element: element,
                quantity: quantityToAdd
            });
        });

        // Sauvegarder les modifications
        await explorateur.save();

        return {
            inoxAdded: inoxToAdd,
            elementsAdded: elementsAdded,
            lootboxesRemaining: explorateur.nbLootboxes
        };
    }
}

export default new ExplorateurRepository();
