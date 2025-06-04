require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

// Import model
require("./user/user.model");
require("./student/student.model");
require("./school/school.model");

const app = express();
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.send("API OK"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Setup apollo server v2
const { ApolloServer } = require("apollo-server");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { default: mongoose } = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewURLParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    const server = new ApolloServer({ typeDefs, resolvers });
    server.listen().then(({ url }) => {
      console.log(`🚀 Server ready at ${url}`);
    });
  })
  .catch((err) => console.error(err));
