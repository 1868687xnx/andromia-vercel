import { Ally } from "../models/ally.model.js";
import { Explorateur } from "../models/explorateur.model.js";
import { Exploration } from "../models/exploration.model.js";
import allyRepository from "./ally.repository.js";

class ExplorationRepository {
  async addForOneUser(body, explorateur_id) {
    const explorateur = await Explorateur.findById(explorateur_id);
    if (!explorateur) {
      throw new Error("Explorateur not found");
    }
    body.explorateur = explorateur_id;
    console.log("BODY EXPLORATION REPO :", body);

    
    const ally = await this.createAlly(body.ally, explorateur_id);
    if (ally) {
      body.ally = ally._id;
    }

    let exploration = await Exploration.create(body);
    explorateur.location = exploration.destination;
    this.addToExplorateurInventory(explorateur, exploration.vault);
    await explorateur.save();
    await exploration.populate('ally', 'uuid');
    exploration = exploration.toObject({ getters: false, virtuals: true });
    exploration = this.transform(exploration);
    console.log(exploration);
    return exploration;
  }

   

  transform(exploration) {
    console.log(exploration.ally);
    if(!exploration.ally)
      return;
    delete exploration.ally._id;
    delete exploration.ally.id;
    exploration.href = `${process.env.BASE_URL}/explorations/${exploration.uuid}`;
    return exploration;
  }

  addToExplorateurInventory(explorateur, vault) {
    try {
      explorateur.inventory.vault.inox += vault.inox;
      for (const element of vault.elements) {
        for (const ExpElement of explorateur.inventory.vault.elements) {
          if (ExpElement.symbol === element.symbol) {
            ExpElement.quantity += element.quantity;
          }
        }
      }
    } catch (err) {
      throw err;
    }
  }

  async createAlly(ally) {
    try {
      if (ally) {
        ally = allyRepository.transform(ally);
        return Ally.create(ally);
      }
    } catch (err) {
      throw err;
    }
  }

  async retrieveByExplorateurUUID(explorateurUUId) {
    const explorateur = await Explorateur.findOne({ uuid: explorateurUUId });
    return Exploration.find({ explorateur: explorateur._id });
  }
}

export default new ExplorationRepository();
