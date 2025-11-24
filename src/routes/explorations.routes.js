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
router.get(
  "/:uuid",
  guardAuthorizationJWT,
  paginateMiddleware({ defaultLimit: 25, defaultMaxLimit: 50 }),
  retrieveAllForUser
);
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

async function retrieveAllForUser(req, res, next) {
  try {
    

    const explorateur = await explorateurRepository.retrieveByUUID(
      req.params.uuid
    );
    if (!explorateur) {
      return next(HttpErrors.NotFound());
    } else {
      const options = {
      skip: req.pagination.skip,
      limit: req.pagination.limit,
      filter: {explorateur},
    };
      let [explorations, totalDocuments] =
        await explorationRepository.retrieveByExplorateurUUID(
          req.params.uuid,
          options
        );
      explorations = explorations.map((e) => {
        e = e.toObject({ getters: false, virtuals: false });
        e = explorationRepository.transform(e);
        return e;
      });
      const totalPages = Math.ceil(totalDocuments / req.pagination.limit);

      if (req.pagination.page > totalPages) {
        throw HttpErrors.BadRequest(
          `La page demandée doit être inférieure à ${totalPages}`
        );
      }

      const responseBody = {
        _metadata: {
          page: req.pagination.page,
          limit: req.pagination.limit,
          skip: req.pagination.skip,
          hasNextPage: req.pagination.page < totalPages,
          totalPages: totalPages,
          totalDocuments: totalDocuments,
        },
        _links: req.pagination.links(totalPages),
        data: explorations,
      };

      res.status(200).json(responseBody);
    }
  } catch (err) {
    return next(err);
  }
}

export default router;
