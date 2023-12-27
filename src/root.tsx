import {component$, createContextId, Signal, useContextProvider, useSignal, useStore} from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";
import {Alert, IAlert} from "~/components/common/alert";
import NotificationBox from "~/components/common/notification-box";

export interface IUser {
    network: number;
    address: string;
}

export const UserContext = createContextId<Signal<IUser>>(
    'docs.user-context',
)

export const NotificationContext = createContextId<IAlert[]>(
    'docs.notification-context'
)

export default component$(() => {
    const user = useSignal<IUser>({ network: 0, address: "" });
    useContextProvider(UserContext, user);

    const notifications = useStore<IAlert[]>([]);
    useContextProvider(NotificationContext, notifications)

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
                <NotificationBox />
            </body>
        </QwikCityProvider>
    );
});
