import { redirect } from "next/navigation";

export default function Home() {
  // Add try-catch for debugging
  try {
    redirect("/login");
  } catch (error) {
    console.error("Redirect failed:", error);
  }
  return null;
}