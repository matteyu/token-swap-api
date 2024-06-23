import axios from "axios";
import { _Chain } from "@lifi/sdk";
import rateLimit from "axios-rate-limit";
import { readCache, writeCache } from "./cache";

const rateLimitedAxiosClient = rateLimit(axios.create(), {
  maxRPS: Number(process.env.MAX_REQUEST_PER_SECOND) || 2,
});
const apiUrl = process.env.SWAP_API_URL || "";

type ChainType = "EVM" | "SVM";

const getChains = async (chain?: ChainType): Promise<_Chain[]> => {
  const selectedChainType = chain ?? "EVM,SVM";
  try {
    const chains = await readCache(selectedChainType);
    if (chains) return JSON.parse(chains);

    const requestData: Record<string, any> = {
      params: {
        chainTypes: selectedChainType,
      },
    };
    if (process.env.LIFI_API_KEY) {
      requestData["headers"] = {
        "x-lifi-api-key": process.env.LIFI_API_KEY,
      };
    }
    const response = await rateLimitedAxiosClient.get(
      `${apiUrl}/chains`,
      requestData
    );
    await writeCache(
      selectedChainType,
      JSON.stringify(response.data.chains),
      Number(process.env.CHAINS_EXPIRY_SECONDS) || 300
    );
    return response.data.chains;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getChainsById = async (
  fromChainId: number,
  toChainId: number,
  chainType?: ChainType
): Promise<Record<string, _Chain>> => {
  try {
    const chains = chainType ? await getChains(chainType) : await getChains();

    let selectedChains: Record<string, _Chain> = {};
    chains.map((chain: _Chain) => {
      if (chain.id === fromChainId) selectedChains["fromChain"] = chain;
      if (chain.id === toChainId) selectedChains["toChain"] = chain;
    });

    return selectedChains;
  } catch (error: any) {
    throw new Error(`Error retrieving chains: ${error.message}`);
  }
};

export { getChains, getChainsById };
