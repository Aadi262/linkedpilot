export function Stats() {
  const stats = [
    { value: "50,000+", label: "Teams using LinkedPilot" },
    { value: "12M+", label: "Messages sent" },
    { value: "4.8/5", label: "Average rating" },
  ];

  return (
    <section className="py-12 px-6 border-y border-white/10 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              {value}
            </div>
            <div className="text-gray-400 mt-1 text-sm">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
