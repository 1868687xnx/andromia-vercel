import { Ally } from "../models/ally.model.js";
import axios from "axios";

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
    let newally = await Ally.findOne({ uuid: allyUUID });
    if (!newally) {
      throw new Error("Ally not found");
    }
    newally.explorateur = explorateur_id;
    const updatedAlly = await Ally.findOneAndUpdate({ uuid: allyUUID }, newally, {
      new: true,
    });
    return updatedAlly;
  }

  // Méthode pour générer un ally aléatoire via l'API externe
  async generateRandomAlly(explorateur_id) {
    try {
      const response = await axios.post(
        "https://api.andromia.science/allies/actions?type=generate",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const allyData = response.data;
      
      // Filtrer les données pour ne garder que les champs du schéma
      const { crypto, books, expireAt, ...validAllyData } = allyData;
      
      let newAlly = new Ally({
        ...validAllyData,
        explorateur: explorateur_id,
      });
      await newAlly.save();
      
      newAlly = newAlly.toObject({ getters: false, virtuals: false });
      newAlly = this.transform(newAlly);
      
      return newAlly;
    } catch (err) {
      console.error("Erreur lors de la génération de l'ally:", err);
      return false;
    }
  }
}

export default new AllyRepository();
