import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

export const middyfy = (handler) => {
  return middy(handler).use(httpErrorHandler());
};
