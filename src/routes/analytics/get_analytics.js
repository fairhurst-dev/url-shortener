import { middyfy } from "#lib/middleware.js";

const getAnalytics = async (event) => {};

export const handler = middyfy(getAnalytics);
