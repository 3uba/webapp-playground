import {component$, useSignal} from "@builder.io/qwik";
import { Tokens } from "~/resources/consts/tokens/Tokens";

export const TokenSelect = component$((props) => {
    return (
      <select bind:value={props.valueObj} onChange$={(e) => props.valueObj.value = e.target.value} class={'h-1/2 mr-2 bg-gray-50 border border-gray-300 text-xs text-grey-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 box p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'}>
        {Object.values(Tokens).map(({ tokenName, active }) => (
          active ? (
            <option key={tokenName} value={tokenName} selected={props.valueObj.value == tokenName}>
              {tokenName}
            </option>
          ) : null
        ))}
      </select>
    );
});