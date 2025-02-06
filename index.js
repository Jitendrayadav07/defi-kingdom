const formData = require("express-form-data");
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require("./routes");
const app = express();
const passport = require("passport");
const session = require("express-session");
const cookieSession = require("cookie-session");
const cookieParser = require('cookie-parser');
dotenv.config();

app.use(
    cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);

app.use(
    session({
      secret: "your-secret",
      resave: true,
      saveUninitialized: true,
    })
);

app.use(cookieParser());

app.use(cors());

app.use(formData.parse());
app.use(bodyParser.json());

const sequelizeDB = require("./config/db.config");
sequelizeDB.sequelize.sync(sequelizeDB);

app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use("/v1", routes);

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});