import { createHash } from "crypto";

const SHORTENED_CODE_LENGTH = 6;

export const generateShortCode = (fullURL) => {
  const now = new Date().toISOString();
  const fullURLAndDate = `${fullURL}` + `${now}`;

  const hash = createHash("md5").update(fullURLAndDate).digest("hex");
  const start = Math.floor(
    Math.random() * (hash.length - SHORTENED_CODE_LENGTH)
  );
  return hash.substring(start, start + SHORTENED_CODE_LENGTH); // pick a substring of the hash
};
