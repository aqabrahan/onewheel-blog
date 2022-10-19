import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "~/models/post.server";
import type { Post } from "~/models/post.server";
import invariant from "tiny-invariant";
import { requireAdminUser } from "~/session.server";

type LoaderData = {
  post?: Post;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  invariant(params.slug, "slug is required");
  if (params.slug === "new") {
    return json<LoaderData>({});
  }
  const post = await getPost(params.slug);
  // const html = post.html();
  if (!post) {
    throw new Response("Not found", { status: 404 });
  }
  return json<LoaderData>({ post });
};
type ActionData =
  | {
      title: string | null;
      slug: string | null;
      markdown: string | null;
    }
  | undefined;

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  invariant(params.slug, "slug is required");

  if (intent === "delete") {
    await deletePost(params.slug);
    return redirect("/posts/admin");
  }

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: ActionData = {
    title: title ? null : "TItle is required",
    slug: slug ? null : "slug is required",
    markdown: markdown ? null : "markdown is required",
  };

  const hasErros = Object.values(errors).some((erroMessage) => erroMessage);
  if (hasErros) {
    return json<ActionData>(errors);
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  if (params.slug === "new") {
    await createPost({ title, slug, markdown });
  } else {
    await updatePost(params.slug, { title, slug, markdown });
  }

  return redirect("/posts/admin");
};

const NewPostRoute = () => {
  const data = useLoaderData() as LoaderData;
  const errors = useActionData() as ActionData;
  const transition = useTransition();
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";
  const isNewPost = !data.post;
  return (
    <div>
      <Form method="post" key={data.post?.slug ?? "new"}>
        <label>
          Post title: {errors?.title ? <em>{errors.title}</em> : null}
          <input type="text" name="title" defaultValue={data.post?.title} />
        </label>
        <label>
          Post slug: {errors?.slug ? <em>{errors.slug}</em> : null}
          <input type="text" name="slug" defaultValue={data.post?.slug} />
        </label>
        <label>
          Markdown {errors?.markdown ? <em>{errors.markdown}</em> : null}
          <textarea name="markdown">{data.post?.markdown}</textarea>
        </label>
        <button
          type="submit"
          disabled={isCreating || isUpdating}
          name="intent"
          value={isNewPost ? "create" : "update"}
        >
          {isNewPost ? (isCreating ? "Creating...!" : "Create post") : null}{" "}
          {isNewPost ? null : isUpdating ? "Updating...!" : "Update post"}{" "}
        </button>
        <button
          type="submit"
          disabled={isDeleting}
          name="intent"
          value="delete"
        >
          {isDeleting ? "Deleting...!" : "Delete post"}{" "}
        </button>
      </Form>
    </div>
  );
};

export default NewPostRoute;

export function CatchBoundary() {
  const caught = useCatch();
  if (caught.status === 404) {
    return (
      <div>
        <strong>oouchhhhhh</strong> NOT-EXISST
      </div>
    );
  }
  throw new Error(`unsoopoert errorr: ${caught.status}`);
}

export function ErrorBoundary({ error }: { error: unknown }) {
  console.log("🚀 ~ file: $slug.tsx ~ line 147 ~ ErrorBoundary ~ error", error);
  if (error instanceof Error) {
    return (
      <div>
        <strong>ERROR 500</strong> UPS!
        <pre>{error.message}</pre>
      </div>
    );
  }
  return (
    <div>
      <strong>ERROR 502----- NO IDEA WHAT HAPPEN</strong> UPS!
    </div>
  );
}
