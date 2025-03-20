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
  return (
    <>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
    </>
  );
};
