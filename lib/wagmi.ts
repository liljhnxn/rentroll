import { http, createConfig, injected } from "wagmi";
import { botchain } from "./chain";

export const config = createConfig({
  chains: [botchain],
  connectors: [
    injected(),
  ],
  transports: {
    [botchain.id]: http("https://rpc.botchain.ai"),
  },
  ssr: true,
});
