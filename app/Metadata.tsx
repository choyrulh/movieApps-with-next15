interface Props {
  seoTitle: string | null;
  seoDescription: string | undefined;
  seoKeywords?: string | undefined;
}

export const Metadata: React.FC<Props> = ({
  seoTitle,
  seoDescription,
  seoKeywords,
}: Props) => {
  const siteTitle = "SlashVerse"; // Set your global site title
  const fullTitle = seoTitle ? `${seoTitle} | ${siteTitle}` : siteTitle;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
    </>
  );
};
