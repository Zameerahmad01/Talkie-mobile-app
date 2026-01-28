import app from "./src/app";
import { connectToDatabase } from "./src/config/database";
import { createServer } from "node:http";
import { initializeSocket } from "./src/utils/socket";

const Port = process.env.PORT || 3000;
const server = createServer(app);

initializeSocket(server);

connectToDatabase()
  .then(() => {
    server.listen(Port, () => {
      console.log(`Server started on port ${Port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start the server", error);
    process.exit(1);
  });
