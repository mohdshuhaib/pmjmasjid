"use server";

export async function fetchAladhanTimings() {
  try {
    // Fetches from Aladhan API with Next.js 1-hour (3600 seconds) revalidation cache
    const res = await fetch(
      "https://api.aladhan.com/v1/timings?latitude=8.631732&longitude=76.808162&method=1",
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error("Failed to fetch timings");

    const data = await res.json();
    return data.data.timings;
  } catch (error) {
    console.error("Aladhan API Error:", error);
    return null;
  }
}