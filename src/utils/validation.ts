import { getAddress } from 'ethers';
import Joi from 'joi'

const customAddressValidation = (value: string, helpers:any) => {
    try {
        const address = getAddress(value);
        return address;
    } catch (error: any) {
        return helpers.error('string.ethAddress', { message: error.message });
    }
};

export const quoteSchema = Joi.object({
    fromTokenAddress: Joi.string().custom(customAddressValidation, 'custom ethereum address validation').required(),
    toTokenAddress: Joi.string().custom(customAddressValidation, 'custom ethereum address validation').required(),
    fromChainId: Joi.number().required(),
    toChainId: Joi.number().required(),
    fromAddress: Joi.string().custom(customAddressValidation, 'custom ethereum address validation').required(),
    toAddress: Joi.string().custom(customAddressValidation, 'custom ethereum address validation'),
    fromAmountWei: Joi.string().required()
})