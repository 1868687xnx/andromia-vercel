import express from "express";
import HttpErrors from "http-errors";
import validator from "./../middlewares/validator.js";
import explorateurRepository from "../repositories/explorateur.repository.js";
import allyRepository from "../repositories/ally.repository.js";
import explorateurValidators from "../validators/explorateur.validator.js";
import { guardAuthorizationJWT } from "../middlewares/authorization.jwt.js";
import { TABLE_ELEMENT } from "../core/constants.js";
import explorationRepository from "../repositories/exploration.repository.js";
import axios from "axios";
import { EXPLORATION_URL } from "../core/constants.js";

const router = express.Router();

router.post("/", explorateurValidators.postValidator(), validator, post);
router.get("/:uuid", guardAuthorizationJWT, retrieveOne);
router.get("/:uuid/vault", guardAuthorizationJWT, retrieveVault);
router.get(
  "/:uuid/allies/",
  guardAuthorizationJWT,
  retrieveAlliesByUUID
);
router.get(
  "/:uuid/explorations",
  guardAuthorizationJWT,
  retrieveAllForUser
);
router.get("/:uuid/allies/:uuidAlly", guardAuthorizationJWT, retrieveOneAlly);
router.patch("/allies/:uuid", guardAuthorizationJWT, addAlly);
router.post("/:uuid/lootboxes", guardAuthorizationJWT, openLootbox);
router.post("/:uuid/explorations", guardAuthorizationJWT, addExploration);

async function post(req, res, next) {
  try {
    let account = await explorateurRepository.create(req.body);
    const tokens = explorateurRepository.generateJWT(account.uuid);
    account = account.toObject({ getters: false, virtuals: false });
    account = explorateurRepository.transform(account);
    res.status(201).json({ account, tokens });
  } catch (err) {
    return next(err);
  }
}

async function retrieveOne(req, res, next) {
  try {
    let account = await explorateurRepository.retrieveByUUID(req.params.uuid);
    if (!account) {
      return next(HttpErrors.NotFound());
    } else {
      account = account.toObject({ getters: false, virtuals: false });
      account = explorateurRepository.transform(account);
      res.status(200).json(account);
    }
  } catch (err) {
    return next(err);
  }
}

async function retrieveVault(req, res, next) {
  try {
    let account = await explorateurRepository.retrieveByUUID(req.params.uuid);
    if (!account) {
      return next(HttpErrors.NotFound());
    } else {
      const vault = account.inventory.vault;
      res.status(200).json(vault);
    }
  } catch (err) {
    return next(err);
  }
}

async function addExploration(req, res, next) {
  try {
    const explorateur = await explorateurRepository.retrieveByUUID(
      req.params.uuid
    );
    if (!explorateur) {
      return next(HttpErrors.NotFound());
    } else {
      let newExploration = await axios.get(EXPLORATION_URL + req.query.key);

      newExploration = await explorationRepository.addForOneUser(
        newExploration.data,
        explorateur._id
      );
      res.status(200).json(newExploration);
      if (req.query._body === "false") {
        return res.status(204).end();
      }
    }
  } catch (err) {
    return next(err);
  }
}

async function addAlly(req, res, next) {
  try {
    let explorateur = await explorateurRepository.retrieveByUUID(req.auth.uuid);
    let newAlly = await allyRepository.createForOneUser(
      req.params.uuid,
      explorateur._id
    );

    if (req.query._body === "false") {
      return res.status(204).end();
    }
    newAlly = newAlly.toObject({ getters: false, virtuals: false });
    newAlly = allyRepository.transform(newAlly);
    res.status(201).json(newAlly);
  } catch (err) {
    return next(err);
  }

}

async function retrieveAlliesByUUID(req, res, next) {
  try {
    const explorateur = await explorateurRepository.retrieveByUUID(
      req.params.uuid
    );
    if (!explorateur) {
      return next(
        HttpErrors.NotFound("Aucun explorateur trouvé avec cet UUID")
      );
    } else {
      const options = {
        filter: { explorateur },
      };
      let [allies] = await allyRepository.retrieveForOneUser(
        explorateur._id,
        options
      );
      allies = allies.map((a) => {
        a = a.toObject({ getters: false, virtuals: false });
        a = allyRepository.transform(a, req.options);
        return a;
      });

      const responseBody = {
        data: allies,
      };
      res.status(200).json(responseBody);
    }
  } catch (err) {
    return next(err);
  }
}

async function retrieveOneAlly(req, res, next) {
  try {
    const explorateur = await explorateurRepository.retrieveByUUID(
      req.params.uuid
    );
    if (!explorateur) {
      return next(
        HttpErrors.NotFound("Aucun explorateur trouvé avec cet UUID")
      );
    }

    let ally = await allyRepository.retrieveByUUID(req.params.uuidAlly);
    if (!ally) {
      return next(HttpErrors.NotFound("Aucun ally trouvé avec cet UUID"));
    }

    res.status(200).json(ally);
  } catch (err) {
    return next(err);
  }
}

async function openLootbox(req, res, next) {
  try {
    const explorateur = await explorateurRepository.retrieveByUUID(
      req.params.uuid
    );
    if (!explorateur) {
      return next(
        HttpErrors.NotFound("Aucun explorateur trouvé avec cet UUID")
      );
    }

    const lootboxResult = await explorateurRepository.openLootbox(
      explorateur,
      TABLE_ELEMENT
    );

    const addAllyChance = Math.random();
    let allyAdded = null;
    if (addAllyChance > 0.5) {
      allyAdded = await allyRepository.generateRandomAlly(explorateur._id);
    }

    res.status(200).json({
      ...lootboxResult,
      ally: allyAdded,
    });
  } catch (err) {
    return next(err);
  }
}

async function retrieveAllForUser(req, res, next) {
  try {
    const explorateur = await explorateurRepository.retrieveByUUID(
      req.params.uuid
    );
    if (!explorateur) {
      return next(HttpErrors.NotFound());
    } else {
      const options = {
        filter: { explorateur },
      };
      let [explorations] =
        await explorationRepository.retrieveByExplorateurUUID(
          req.params.uuid,
          options
        );
      explorations = explorations.map((e) => {
        e = e.toObject({ getters: false, virtuals: false });
        e = explorationRepository.transform(e);
        return e;
      });

      const responseBody = {
        data: explorations,
      };

      res.status(200).json(responseBody);
    }
  } catch (err) {
    return next(err);
  }
}

export default router;
