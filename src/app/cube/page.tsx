import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { redirect } from "next/navigation";

import Cube from "@/components/Cube";

type PageProps = {
  searchParams?: {
    guest?: string;
  };
};

export default async function CubePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session && searchParams?.guest !== "true") {
    redirect("/");
  }

  return (
    <div className="h-screen">
      <Cube />
    </div>
  );
}