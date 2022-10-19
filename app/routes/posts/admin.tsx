import { Link, Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getPostListing } from "~/models/post.server";
import { requireAdminUser } from "~/session.server";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPostListing>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUser(request);
  return json<LoaderData>({ posts: await getPostListing() });
};

const AdminRoute = () => {
  const { posts } = useLoaderData() as LoaderData;
  return (
    <div>
      <h1>BLOG ADMINISTRATION</h1>
      <ul>
        {posts.map((post) => {
          return (
            <li key={post.slug}>
              <Link to={post.slug}>{post.title}</Link>
            </li>
          );
        })}
      </ul>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminRoute;
