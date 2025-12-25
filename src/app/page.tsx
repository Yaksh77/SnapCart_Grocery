import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoy from "@/components/DeliveryBoy";
import EditRoleMobile from "@/components/EditRoleMobile";
import Footer from "@/components/Footer";
import GeoUpdater from "@/components/GeoUpdater";
import Navbar from "@/components/Navbar";
import UserDashboard from "@/components/UserDashboard";
import authOptions from "@/lib/auth";
import connectDB from "@/lib/db";
import Grocery, { IGrocery } from "@/models/grocery.model";
import User from "@/models/user.model";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

// Home component will be always server component
export default async function Home(props: {
  searchParams: Promise<{ search: string }>;
}) {
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

  const searchParams = await props.searchParams;

  let groceryList: IGrocery[] = [];

  if (user.role === "user") {
    groceryList = await Grocery.find(
      searchParams.search
        ? {
            $or: [
              { name: { $regex: searchParams.search, $options: "i" } },
              { category: { $regex: searchParams.search, $options: "i" } },
            ],
          }
        : {}
    );
  } else {
    groceryList = await Grocery.find({});
  }

  const plainUser = JSON.parse(JSON.stringify(user));
  return (
    <>
      <Navbar user={plainUser} />
      <GeoUpdater userId={plainUser._id} />
      {user.role == "user" ? (
        <UserDashboard groceryList={groceryList} />
      ) : user.role == "admin" ? (
        <AdminDashboard />
      ) : (
        <DeliveryBoy />
      )}
      <Footer />
    </>
  );
}
