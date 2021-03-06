const morgan = require("morgan");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
morgan.token("data", (req, res) => {
  if (req.method == "POST") {
    return [req.body.title, req.body.author];
  }
  if (req.method == "PUT") {
    return [req.body.title, req.body.author];
  }
});

const morganmiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms :data"
);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({
      error: "invalid token1",
    });
  }

  next(error);
};
const tokenExtractor = (request, response, next) => {
  const authorization = request.get("Authorization");
  console.log("printign request: authorization", authorization);
  if (authorization && authorization.startsWith("bearer ")) {
    console.log("setting request token");
    request.token = authorization.substring(7);
  } else {
    request.token = null;
  }
  next();
};

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(decodedToken.id);
  if (user) {
    console.log("setting request user");
    request.user = user;
  } else {
    request.user = null;
  }
  next();
};
module.exports = {
  unknownEndpoint,
  errorHandler,
  morganmiddleware,
  tokenExtractor,
  userExtractor,
};
