import { Helmet } from "react-helmet-async";

const BASE_URL = "https://www.align.ai";

export default function SEO({ title, description, canonicalPath, noIndex = false }) {
  const fullTitle = title
    ? `${title} | Align`
    : "Align | AI Resume Builder Using Jake's Resume Template";
  const canonical = `${BASE_URL}${canonicalPath}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
