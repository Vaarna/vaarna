import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router"

export default function Asset({ name }) {
    const { query: { spaceId, id } } = useRouter();

    return <>
        <Link href={`/space/${spaceId}/asset/123`}>link to 123</Link>
        <Link href={`/space/${spaceId}/asset/abba`}>link to abba</Link>
        <p>Asset named {name}, with id {id}, in space {spaceId}</p>
    </>
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    let name = "unknown";

    if (ctx.query.id === "abba")
        name = "abba"

    return {
        props: { name }
    }
}
