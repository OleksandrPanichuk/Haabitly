
import { HabitsView } from "@/features/habits";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

const Page = () => {
  const queryClient = getQueryClient();

  void queryClient.prefetchInfiniteQuery(
    trpc.habits.getTodayHabits.infiniteQueryOptions(),
  );

  return (
    <HydrateClient>
      <div>
        <HabitsView />
      </div>
    </HydrateClient>
  );
};

export default Page;
