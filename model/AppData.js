const mongoose = require("mongoose");

const SchemaAppData = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: false,
    default: "true",
  },
});

const AppData = mongoose.model("v3jmm4sr6vk_appdata", SchemaAppData);

module.exports = AppData;

