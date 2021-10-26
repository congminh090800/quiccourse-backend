function baseResponse(req, res, next) {
  return function baseResponse(req, res, next) {
    function success(data, statusCode) {
      res.status(statusCode).send({
        data: data,
      });
    }

    function failure(message, statusCode, code, data) {
      var resData = {
        message: message,
        error: "error",
        code: code,
      };
      if (data) {
        resData = { ...resData, ...data };
      }
      res.status(statusCode).send(resData);
    }

    res.success = success;
    res.failure = failure;

    res.ok = (data) => {
      success(data, 200);
    };

    res.badRequest = (message = "Bad Request", code = "", data = {}) => {
      failure(message, 400, code, data);
    };

    res.notFound = (message = "Not Found", code = "", data = {}) => {
      failure(message, 404, code, data);
    };

    res.serverInternalError = (
      message = "Server Internal Error",
      code = "",
      data = {}
    ) => {
      failure(message, 500, code, data);
    };

    res.forbidden = (message = "Forbidden", code = "", data = {}) => {
      failure(message, 403, code, data);
    };

    res.unauthorized = (message = "Unauthorized", code = "", data = {}) => {
      failure(message, 401, code, data);
    };

    next();
  };
}

module.exports = baseResponse;
