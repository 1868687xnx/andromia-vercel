import { Ally } from "../models/ally.model.js";

class AllyRepository {
  retrieveByUUID(uuid) {
    return Ally.findOne({ uuid: uuid });
  }

  retrieveForOneUser(idExplorateur, options) {
    const retrieveQuery = Ally.find(options.filter)
      .limit(options.limit)
      .skip(options.skip)
      .sort({ explorationDate: 1 });
    return Promise.all([retrieveQuery, Ally.countDocuments(options.filter)]);
  }

  transform(ally) {
    delete ally.explorateur;
    delete ally.books;
    delete ally.expireAt;
    delete ally.crypto;
    return ally;
  }

  async createForOneUser(allyUUID, explorateur_id) {
    console.log("ALLY UUID REPO :", allyUUID);
    let newally = await Ally.findOne({ uuid: allyUUID });
    console.log("NEW ALLY :", newally);
    if (!newally) {
      throw new Error("Ally not found");
    }
    newally.explorateur = explorateur_id;
    const updatedAlly = await Ally.findOneAndUpdate({ uuid: allyUUID }, newally, {
      new: true,
    });
    // Fetch the updated Ally
    return updatedAlly;
  }

  // Méthode pour générer un ally aléatoire via l'API externe
  async generateRandomAlly(explorateur_id) {
    try {
      const response = await fetch(
        "https://api.andromia.science/allies/actions?type=generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
