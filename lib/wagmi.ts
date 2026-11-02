import { http, createConfig, injected } from "wagmi";
import { botchainTestnet } from "./chain";

export const config = createConfig({
  chains: [botchainTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [botchainTestnet.id]: http("https://rpc.bohr.life"),
  },
  ssr: true,
});
