require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

// Import model (pastikan load agar model terdaftar)
require("./user/user.model");
require("./student/student.model");
require("./school/school.model");

const app = express();
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.send("API OK"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
