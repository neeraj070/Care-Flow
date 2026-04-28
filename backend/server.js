require("dotenv").config();
const connectDB = require("./src/config/db");
const app = require("./src/app");
const seedAdmin = require("./src/utils/seedAdmin");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend", error);
    process.exit(1);
  }
};

startServer();
