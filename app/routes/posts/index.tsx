import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getPostListing } from "~/models/post.server";
import { useOptionalAdminUser } from "~/utils";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPostListing>>;
};

export const loader: LoaderFunction = async () => {
  const posts = await getPostListing();

  return json<LoaderData>({ posts });
};
export default function PostsRoute() {
  const { posts } = useLoaderData() as LoaderData;
  const adminUser = useOptionalAdminUser();
  return (
    <main>
      <h1>Posts</h1>
      {adminUser && <Link to="admin">GO TO ADMIN</Link>}
      <ul>
        {posts.map((post) => {
          return (
            <li key={post.slug}>
              <Link to={post.slug} prefetch="intent">
                {post.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
