import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";

export default async function Home() {
  const authenticated = await isAuthenticated();
  
  if (authenticated) {
    redirect("/news-sources");
  }
  
  redirect("/login");
}
