import { redirect } from "next/navigation";

// /today is a canonical shareable URL — redirect to home
export default function TodayPage() {
  redirect("/");
}
