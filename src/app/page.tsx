import { loadProblems } from "@/lib/load-problems";
import { ClientApp } from "./client-app";

export default function Home() {
  return <ClientApp problems={loadProblems()} />;
}
