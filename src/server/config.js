const configVariables = {
  stage: process.env.STAGE || "dev",
  mongoURL:
    process.env.MONGO_URL ||
    "mongodb+srv://testusername:8DaXAe9sRUz8T01b@unfiltered-cluster.qfccv.mongodb.net/",
  PORT: Number(process.env.PORT) || 8080,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  JWT_SECRET: "s0c13l@pp",
  JWT_EXPIRATION: "7d",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "rzp_live_RKKqo4uLM9Dmie", // for prod
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "t01VcNnFRqFxyiQ4S1bhcfWi", // for prod
  // RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "rzp_test_RTQXhKmDvfL3Z4", // for testing
  // RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "gkmHPKhW75FOzu3bIXolWaox", // for testing
};
export default configVariables;
