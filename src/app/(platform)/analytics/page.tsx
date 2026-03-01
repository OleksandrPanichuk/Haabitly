import { AnalyticsView } from "@/features/analytics";
import { HydrateClient } from "@/trpc/server";

const Page = async () => {
    return (
        <HydrateClient>
            <AnalyticsView />
        </HydrateClient>
    );
};

export default Page;
