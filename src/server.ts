import config from "./config";
import { createApp } from "./app";

const app = createApp();

app.listen(config.port, () => {
  console.log(`Syriatel SMS integration listening on port ${config.port}`);
});
