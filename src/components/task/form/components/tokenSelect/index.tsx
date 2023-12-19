import { component$ } from "@builder.io/qwik";
import { Tokens } from "~/resources/consts/tokens/Tokens";

interface TokenSelectProps {
  fieldProps: any;
  fieldValue: any;
}

export const TokenSelect = component$<TokenSelectProps>(({ fieldProps, fieldValue }) => {
    return (
      <select
        class={'h-1/2 mr-2 bg-gray-50 border border-gray-300 text-xs text-grey-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 box p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'}
        {...fieldProps}
      >
        {Object.values(Tokens).map(({ tokenName, active }) => (
          active ? (
            <option key={tokenName} value={tokenName} selected={tokenName === fieldValue}>
              {tokenName}
            </option>
          ) : null
        ))}
      </select>
    );
});