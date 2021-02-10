import Link from "next/link"
import Button from "../components/Button"

export default function Index() {
    return <>
        <h1>gm-screen</h1>
        <Button text="hello world" />
        <Button text="bye world" />
        <Link href="/about">About</Link>
    </>
}
