const configVariables = {
  stage: process.env.STAGE || "dev",
  mongoURL:
    process.env.MONGO_URL ||
    "mongodb+srv://testusername:8DaXAe9sRUz8T01b@unfiltered-cluster.qfccv.mongodb.net/",
  PORT: Number(process.env.PORT) || 8080,
  JWT_SECRET: "s0c13l@pp",
  JWT_EXPIRATION: "7d",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
};
export default configVariables;
