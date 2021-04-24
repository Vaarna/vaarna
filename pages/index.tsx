import { useSession } from "hook/useSession";

export default function Index(): React.ReactNode {
  const { isLoggedIn, session } = useSession();

  return (
    <>
      <p>This is the homescreen. There is no content here yet.</p>
      <code>{JSON.stringify(session)}</code>
      {isLoggedIn ? (
        <form method="post" action="/api/auth/signout">
          <button>Logout</button>
        </form>
      ) : (
        <form method="post" action="/api/auth/signin/google">
          <input type="hidden" name="redirect" value="/" />
          <button>Login</button>
        </form>
      )}
    </>
  );
}
