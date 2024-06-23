import { Request, Response } from "express";
import axios from "axios";
import { getChainsById } from "../utils/chains";
import { getConnections } from "../utils/connections";
import { quoteSchema } from "../utils/validation";
import rateLimit from "axios-rate-limit";

const apiUrl = process.env.SWAP_API_URL || "";
const rateLimitedAxiosClient = rateLimit(axios.create(), {
  maxRPS: Number(process.env.MAX_REQUEST_PER_SECOND) || 2
});

const getQuote = async (req: Request, res: Response) => {
  const { error } = quoteSchema.validate(req.body);

  if (error) throw new Error(error.message);

  const {
    fromTokenAddress,
    fromChainId,
    toTokenAddress,
    toChainId,
    fromAmountWei,
    fromAddress,
    toAddress,
  } = req.body;

  try {
    // step 1 - retrieve chains
    const chainPair = await getChainsById(fromChainId, toChainId);

    // step 2 - retrieve available connections
    const tokenPair = { fromTokenAddress, toTokenAddress };
    const connections = await getConnections(chainPair, tokenPair);

    if (connections.length) {
      const requestParams: Record<string, string> = {
        fromChain: chainPair.fromChain.key,
        toChain: chainPair.toChain.key,
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        fromAddress: fromAddress,
        fromAmount: fromAmountWei,
      };
      if (toAddress) requestParams["toAddress"] = toAddress;

      const requestData:Record<string, any> = {
        params: requestParams
      }
      if(process.env.LIFI_API_KEY){
        requestData['headers'] = {
            'x-lifi-api-key': process.env.LIFI_API_KEY
        }
      }

      // step 3 - retrieve quote
      const response = await rateLimitedAxiosClient.get(`${apiUrl}/quote`, requestData);

      res.status(200).json(response.data);

      return;
    }

    res.status(404).json({ message: "Quote not found." });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Error fetching quote", error: error.message });
  }
};

export { getQuote };
