import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var sessionSchema = new mongoose.Schema(
  {
    expires: {
      type: Date,
    },
    session: {
      type: String,
    },
  },
);

//Export the model
const Session = mongoose.model("Session", sessionSchema);

export default Session;
