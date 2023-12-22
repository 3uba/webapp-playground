import {component$, useContext} from "@builder.io/qwik";
import {NotificationContext} from "~/root";
import {Alert} from "~/components/common/alert";

export default component$(() => {
    const notifications = useContext(NotificationContext)

    return (
        <div class={"w-full fixed bottom-2 flex items-center justify-center flex-col"}>
            {notifications.map((alert, index) => (
                <Alert key={index} alert={alert} />
            ))}
        </div>
    )
})