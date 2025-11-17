import Exploration from '../models/exploration.model.js';


class ExplorationRepository {

    async addForOneUser(exploration, explorateurId) {
        exploration.explorateur = explorateurId;
        return await Exploration.create(exploration);
    }

}

export default new ExplorationRepository();