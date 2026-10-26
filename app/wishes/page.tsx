import type { Metadata } from "next";
import Guestbook from "./guestbook";

export const metadata: Metadata = {
  title: "Wishes for Komal & Harsh · The Wedding Guestbook",
  description: "A collection of love, blessings and beautiful wishes for Komal & Harsh. Read messages from their loved ones.",
  alternates: { canonical: "/wishes" },
};

export default function WishesPage() {
  return <Guestbook />;
}
