import axios from "axios";
import useSWR from "swr";

async function fetcher(url: string): Promise<Record<string, unknown>> {
  return axios.get(url).then((v) => v.data);
}

type Out =
  | {
      isLoggedIn: false;
      session: undefined;
    }
  | {
      isLoggedIn: true;
      session: Record<string, unknown>;
    };

export const useSession = (): Out => {
  const { data, error } = useSWR("/api/auth/session", fetcher);
  console.log(data);

  const isLoggedIn = !error && Boolean(data);

  if (isLoggedIn && data) {
    return {
      isLoggedIn,
      session: data,
    };
  }

  return {
    isLoggedIn: false,
    session: undefined,
  };
};
