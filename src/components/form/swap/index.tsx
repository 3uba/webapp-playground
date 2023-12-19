import {type Input, minLength, object, number, minValue, string} from 'valibot';

export const SwapSchema = object({
    swapIn: string([]),
    swapAmountIn: number([
        minValue(0.0001, 'Amount must be greater than 0.0001'),
    ]),
    swapOut: string([]),
    swapAmountOut: number([
        minValue(0.0001, 'Amount must be greater than 0.0001'),
    ]),
});

export type SwapForm = Input<typeof SwapSchema>;