import { unstable_cache } from "next/cache";
import AboutUsPageClient from "./page-client";
import { client } from "../../sanity/lib/client";

export const metadata = {
  title: "Dreamon | About Us",
};

const FAQ_QUERY = `
  *[_type == "faq" && isActive == true] | order(order asc) {
    title,
    body
  }
`
const options = { next: { revalidate: 60 * 10 } };
const getFaq = unstable_cache(
    async () => client.fetch(FAQ_QUERY, {}, options),
    ["faq-list"],
    { revalidate: 60 * 5 }
);

export default async function AboutUsPage() {
  const faqList = await getFaq();
  return <AboutUsPageClient faqList={faqList} />;
}