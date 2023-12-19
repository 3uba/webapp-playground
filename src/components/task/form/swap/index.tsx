import {type Input, object, number, minValue, string} from 'valibot';

export const SwapSchema = object({
    swapIn: string([]),
    swapAmountIn: number([
        minValue(0.0001, 'Amount must be greater than 0.0001'),
    ]),
    swapOut: string([]),
    // swapAmountOut: number([]),
});

export type SwapForm = Input<typeof SwapSchema>;