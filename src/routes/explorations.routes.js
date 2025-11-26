import express from "express";
import HttpErrors from "http-errors";
import explorationRepository from "../repositories/exploration.repository.js";
import explorateurRepository from "../repositories/explorateur.repository.js";
import axios from "axios";
import { EXPLORATION_URL } from "../core/constants.js";
import { guardAuthorizationJWT } from "../middlewares/authorization.jwt.js";
import paginateMiddleware from "../middlewares/paginate.js";

const router = express.Router();

//router.post("/Ally", addAlly);

router.post("/:uuid/explorations/:key", guardAuthorizationJWT, addExploration);

async function addExploration(req, res, next) {
  try {
    const explorateur = await explorateurRepository.retrieveByUUID(
      req.params.uuid
    );
    if (!explorateur) {
      return next(HttpErrors.NotFound());
    } else {
      let newExploration = await axios.get(EXPLORATION_URL + req.params.key);

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

export default router;
