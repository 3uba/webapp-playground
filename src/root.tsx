import {component$, createContextId, Signal, useContextProvider, useSignal} from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";

export const UserContext = createContextId<Signal<object>>(
    'docs.user-context',
)

export default component$(() => {
    const user = useSignal({ network: 0, address: "" });
    useContextProvider(UserContext, user);

    return (
        <QwikCityProvider>
            <head>
                <meta charSet="utf-8" />
                <link rel="manifest" href="/manifest.json" />
                <RouterHead />
                <ServiceWorkerRegister />
            </head>
            <body lang="en">
                <RouterOutlet />
            </body>
        </QwikCityProvider>
    );
});
