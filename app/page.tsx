import { getHomepageData } from "@/lib/homepage";
import HomePageClient from "@/components/home/HomePageClient";

export const revalidate = 1800;

export default async function HomePage() {
  const data = await getHomepageData();

  return <HomePageClient data={data} />;
}