const configVariables = {
  stage: process.env.STAGE || "dev",
  mongoURL:
    process.env.MONGO_URL ||
    "mongodb://localhost:27017/",
  PORT: Number(process.env.PORT) || 8080,
  JWT_SECRET: "s0c13l@pp",
  JWT_EXPIRATION: "7d",
  EMAIL_USER: process.env.EMAIL_USER || "iskconwavecityg@gmail.com",
  EMAIL_PASS: process.env.EMAIL_PASS || "ajzrytbbrdrylgha",
};
export default configVariables;
