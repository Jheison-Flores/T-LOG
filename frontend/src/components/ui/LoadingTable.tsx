export function LoadingTable() {
  return (
    <div className="space-y-3">

      {Array.from({
        length: 8,
      }).map((_, index) => (
        <div
          key={index}
          className="h-14 rounded-lg bg-gray-200 animate-pulse"
        />
      ))}

    </div>
  );
}