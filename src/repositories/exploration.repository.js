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
    
    if (body.vault && body.vault.elements) {
      body.vault.elements = body.vault.elements.map(el => ({
        symbol: el.element || el.symbol,
        quantity: el.quantity
      }));
    }

    const ally = await this.createAlly(body.ally);
    if (ally) {
      body.ally = ally._id;
    }
    let exploration = await Exploration.create(body);
    explorateur.location = exploration.destination;
    this.addToExplorateurInventory(explorateur, exploration.vault);
    await explorateur.save();
    exploration = await exploration.populate("ally");
    exploration = exploration.toObject({ getters: false, virtuals: true });
    exploration = this.transform(exploration);
    return exploration;
  }

  transform(exploration) {
    if (!exploration.ally) return exploration;
    
    delete exploration.ally._id;
    delete exploration.explorateur;
    delete exploration.ally.explorateur;
    delete exploration.ally.id;
    delete exploration.id;
    delete exploration._id;
    delete exploration.updatedAt;
    delete exploration.__y;
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

  async retrieveByExplorateurUUID(explorateurUUId, options) {
    const explorateur = await Explorateur.findOne({ uuid: explorateurUUId });
    const explorations = await Exploration.find(options.filter)
      .limit(options.limit)
      .skip(options.skip)
      .sort({ explorationDate: 1 })
      .select('-ally');
    
    const count = await Exploration.countDocuments(options.filter);
    
    return [explorations, count];
  }
}

export default new ExplorationRepository();
