import {type Input, minLength, object, number, minValue} from 'valibot';

export const SwapSchema = object({
    swapAmount: number([
        minValue(0.0001, 'Amount must be greater than 0.0001'),
    ]),
});

export type SwapForm = Input<typeof SwapSchema>;