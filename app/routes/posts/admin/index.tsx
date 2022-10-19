import type { LoaderFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireAdminUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUser(request);
  return json({});
};

const AdminIndexRoute = () => {
  return <Link to="new">CREATE NEW POST</Link>;
};
export default AdminIndexRoute;
