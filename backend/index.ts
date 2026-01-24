import app from "./src/app";
import { connectToDatabase } from "./src/config/database";

const Port = process.env.PORT || 3000;
connectToDatabase()
  .then(() => {
    app.listen(Port, () => {
      console.log(`Server started on port ${Port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start the server", error);
    process.exit(1);
  });
