import { safebrowsing } from "@googleapis/safebrowsing";
import { andThen, hasPath, tryCatch, ifElse, pipe, always } from "ramda";
import { makeURLSafetyCheckInput } from "./utils.js";

const sendToSafeBrowsingAPI = (input) =>
  safebrowsing("v4").threatMatches.find(input);

export const isSafeURL = tryCatch(
  pipe(
    makeURLSafetyCheckInput,
    sendToSafeBrowsingAPI,
    andThen(ifElse(hasPath(["data", "matches"]), always(false), always(true)))
  ),
  (err) => {
    console.error("Error checking URL safety:", err);
    throw new Error("URLSafetyCheckFailedException");
  }
);
