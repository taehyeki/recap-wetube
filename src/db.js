import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });

const db = mongoose.connection;

const handleError = (error) => console.log("Error code : ", error);
const handleOpen = () => console.log("✅ Connected DB 🚀");
db.on("error", handleError);
db.once("open", handleOpen);
