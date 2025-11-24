import { Ally } from '../models/ally.model.js';


class AllyRepository {
    retrieveByUUID(uuid) {
        return Ally.find({uuid: uuid});
    }

    retrieveForOneUser(idExplorateur) {
        const allies = Ally.find({explorateur: idExplorateur});

        console.log(allies);
        return allies;
    }

    transform(ally, explorateur_id = null) {
        ally.explorateur = explorateur_id;
        delete ally.books;
        delete ally.expireAt;
        delete ally.crypto;
        return ally;
    }

    async createForOneUser(allyUUID, explorateur_id) {
        console.log("ALLY UUID REPO :", allyUUID);
        let newally = await Ally.findOne({uuid: allyUUID});
        console.log("NEW ALLY :", newally);
        if (!newally) {
            throw new Error("Ally not found");
        }
        const updatedAllyData = this.transform(newally.toObject(), explorateur_id);
        await Ally.findOneAndUpdate(
            { uuid: allyUUID },
            updatedAllyData,
            { new: true }
        );
        // Fetch the updated Ally
        const updatedAlly = await Ally.findOne({uuid: allyUUID});
        return updatedAlly;
    }

    // Méthode pour générer un ally aléatoire via l'API externe
    async generateRandomAlly(explorateur_id) {
        try {
            const response = await fetch('https://api.andromia.science/allies/actions?type=generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const allyData = await response.json();
                // Créer l'ally pour cet utilisateur
                await this.createForOneUser(allyData.uuid, explorateur_id);
                return true;
            }
            return false;
        } catch (err) {
            console.error("Erreur lors de la génération de l'ally:", err);
            return false;
        }
    }
}

export default new AllyRepository();
