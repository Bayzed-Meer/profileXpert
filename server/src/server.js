const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//routes
app.use("/auth", authRoute);
app.use("/users", userRoute);

//connect to mongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.error("Error connecting to database:", err));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
