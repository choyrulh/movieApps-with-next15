import Image from "next/image";

const CastsCard = ({ member }: { member: any }) => {
  return (
    <div
      key={member.id}
      className="group relative aspect-[2/3] transition-transform duration-300 hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl">
        {member.profile_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${member.profile_path}`}
            alt={member.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white uppercase">
              {member.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </span>
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
      </div>

      {/* Text Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-end space-y-1">
        <h3 className="text-white font-semibold truncate drop-shadow-lg">
          {member.name}
        </h3>
        <p className="text-sm text-cyan-300 truncate font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {member.character}
        </p>
        <div className="absolute right-3 top-3 flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 backdrop-blur-sm text-cyan-400 text-sm font-bold transition-opacity opacity-0 group-hover:opacity-100">
          {member.order + 1}
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:border-cyan-400/30 pointer-events-none" />
    </div>
  );
};

export default CastsCard;
