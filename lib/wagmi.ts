import { http, createConfig, injected } from "wagmi";
import { botchainMainnet } from "./chain";

export const config = createConfig({
  chains: [botchainMainnet],
  connectors: [
    injected(),
  ],
  transports: {
    [botchainMainnet.id]: http("https://rpc.botchain.ai"),
  },
  ssr: true,
});
