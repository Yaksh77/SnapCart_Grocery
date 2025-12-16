import EditRoleMobile from "@/components/EditRoleMobile";
import Navbar from "@/components/Navbar";
import authOptions from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

// Home component will be always server component
export default async function Home() {
  await connectDB();
  const session = await getServerSession(authOptions);
  const user = await User.findById(session?.user?.id);
  if (!user) {
    redirect("/login");
  }

  const inComplete =
    !user.mobile || !user.role || (!user.mobile && user.role === "user");
  if (inComplete) {
    redirect("/complete-profile");
  }

  const plainUser = JSON.parse(JSON.stringify(user));
  return (
    <>
      <Navbar user={plainUser} />
    </>
  );
}
