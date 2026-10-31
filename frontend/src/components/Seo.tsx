import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Microsoft Club GIKI';
const SITE_URL = 'https://mlsaclubgiki.tech';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  alternateName: ['Microsoft Club-GIKI', 'MLSA GIKI', 'Microsoft Learn Student Ambassadors GIKI'],
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  description:
    'Student tech community at Ghulam Ishaq Khan Institute (GIKI). Workshops, hackathons, projects, and the Logikal podcast.',
  sameAs: [
    'https://www.instagram.com/microsoftclubgiki/',
    'https://www.linkedin.com/company/microsoft-club-giki/',
    'https://www.youtube.com/@LOGIKALGIKI',
    'https://linktr.ee/MS_clubgiki',
  ],
};

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const Seo = ({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  noIndex = false,
  jsonLd,
}: SeoProps) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${SITE_URL}${normalizedPath === '/' ? '/' : normalizedPath}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const structuredData = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {structuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
