import axios from "axios";
import { Connection, _Chain } from "@lifi/sdk";
import rateLimit from "axios-rate-limit";
import { readCache, writeCache } from "./cache";

const rateLimitedAxiosClient = rateLimit(axios.create(), {
  maxRPS: Number(process.env.MAX_REQUEST_PER_SECOND) || 2,
});

const apiUrl = process.env.SWAP_API_URL || "";

const getConnections = async (
  chainPair: Record<string, _Chain>,
  tokenAddressPair: Record<string, string>,
  chainType?: string
): Promise<Connection[]> => {
  try {
    const cacheKey = JSON.stringify(chainPair).concat(
      JSON.stringify(tokenAddressPair)
    );

    const connections = await readCache(cacheKey);

    if (connections) {
      return JSON.parse(connections);
    } else {
      const requestParams: Record<string, string> = {
        fromChain: chainPair.fromChain.key,
        toChain: chainPair.toChain.key,
        fromToken: tokenAddressPair.fromTokenAddress,
        toToken: tokenAddressPair.toTokenAddress,
      };
      if (chainType) requestParams["chainTypes"] = chainType;

      const requestData: Record<string, any> = {
        params: {
          params: requestParams,
        },
      };
      if (process.env.LIFI_API_KEY) {
        requestData["headers"] = {
          "x-lifi-api-key": process.env.LIFI_API_KEY,
        };
      }

      const response = await rateLimitedAxiosClient.get(
        `${apiUrl}/connections`,
        requestData
      );

      await writeCache(
        cacheKey,
        JSON.stringify(response.data.connections),
        Number(process.env.CONNECTIONS_EXPIRY_SECONDS) || 60
      );

      return response.data.connections;
    }
  } catch (error: any) {
    throw new Error(`Error retrieving connections: ${error.message}`);
  }
};

export { getConnections };
