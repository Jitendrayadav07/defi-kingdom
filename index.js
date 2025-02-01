const formData = require("express-form-data");
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require("./routes");
const app = express();

app.use(cors());

app.use(formData.parse());
app.use(bodyParser.json());

const sequelizeDB = require("./config/db.config");
sequelizeDB.sequelize.sync(sequelizeDB);

// Use routes
app.use("/v1", routes);

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});