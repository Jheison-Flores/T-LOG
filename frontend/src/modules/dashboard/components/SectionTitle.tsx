interface Props {
  title: string;
  subtitle?: string;
}

export function SectionTitle({
  title,
  subtitle,
}: Props) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-gray-800">
        {title}
      </h2>

      {subtitle && (
        <p className="text-sm text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}