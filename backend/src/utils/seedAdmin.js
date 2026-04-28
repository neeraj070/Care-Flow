const bcrypt = require("bcryptjs");
const User = require("../models/User");

const DEFAULT_ADMIN_EMAIL = "admin@hospital.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@12345";
const DEFAULT_ADMIN_USERNAME = "Hospital Admin";

const seedAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await User.findOneAndUpdate(
    { email: adminEmail, role: "admin" },
    {
      username: adminUsername,
      email: adminEmail,
      password: passwordHash,
      role: "admin",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  // eslint-disable-next-line no-console
  console.log(`Admin account ready: ${adminEmail}`);
};

module.exports = seedAdmin;
module.exports.DEFAULT_ADMIN_EMAIL = DEFAULT_ADMIN_EMAIL;
module.exports.DEFAULT_ADMIN_PASSWORD = DEFAULT_ADMIN_PASSWORD;
