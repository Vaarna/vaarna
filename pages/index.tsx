import Link from "next/link";
import SpaceSelector from "component/SpaceSelector";

export default function Index() {
  return (
    <>
      <h1>gm-screen</h1>
      <SpaceSelector />

      <Link href="/item">Items</Link>
    </>
  );
}
