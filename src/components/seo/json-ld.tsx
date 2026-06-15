type JsonLdValue = Record<string, unknown>;

export function JsonLd({
  data,
}: {
  data: JsonLdValue | JsonLdValue[];
}) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
