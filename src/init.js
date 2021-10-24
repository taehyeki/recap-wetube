import "regenerator-runtime";
import "dotenv/config";
import "./db.js";
import "./models/Video.js";
import "./models/User.js";
import "./models/Comment";
import app from "./server.js";
const PORT = process.env.PORT || 4000;
const handleListening = () => {
  console.log(`✅ Server is listening on ${PORT} port 🚀`);
};
app.listen(PORT, handleListening);
