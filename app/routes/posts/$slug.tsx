import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { marked } from "marked";

import { getPost } from "~/models/post.server";
import invariant from "tiny-invariant";

type LoaderData = {
  title: string;
  html: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { slug } = params;
  invariant(slug, "slug is required");

  const post = await getPost(slug);
  invariant(post, `post not found ${slug}`);
  const html = marked(post?.markdown);

  return json<LoaderData>({ title: post.title, html });
};
const PostRoute = () => {
  const { title, html } = useLoaderData() as LoaderData;
  return (
    <main>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
};

export default PostRoute;
