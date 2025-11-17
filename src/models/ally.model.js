import mongoose from "mongoose";
import crypto from "crypto";

const allySchema = mongoose.Schema(
  {
    explorateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Explorateur",
      required: false,
    },
    uuid: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    base64: {
      type: String,
      default: crypto.randomBytes(16).toString("base64url"),
    },
    stats: {
      type: mongoose.Schema.Types.Array,
      required: true,
    },
    kernel: {
      type: mongoose.Schema.Types.Array,
      required: true,
    },
    archiveIndex: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    name: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    affinity: {
      type: mongoose.Schema.Types.Array,
      required: true,
    },
    essence: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    asset: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    href: { type: mongoose.Schema.Types.String, 
        required: true },
    },
  {
    collection: "allies",
    strict: "throw",
    timestamps: true,
  }
);

const Ally = mongoose.model("Ally", allySchema);

export { Ally };
