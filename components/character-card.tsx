import { characters } from '@/lib/characters';

export default function CharacterCard({ character }: { character: typeof characters[number] }) {
  return (
    <div className="card-glow rounded-2xl overflow-hidden bg-bg-card flex flex-col group cursor-pointer">
      <div className="relative h-48 flex items-center justify-center bg-gradient-to-br from-[#1a1a3e] to-[#0f0f2a]">
        <div
          className={`w-28 h-28 rounded-full bg-gradient-to-br ${character.gradient} flex items-center justify-center text-5xl floating shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          {character.emoji}
        </div>
        <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-400 online-indicator" />
      </div>

      <div className="p-5 flex flex-col gap-2.5 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-text-primary">{character.name}</h3>
          <span className="text-sm text-text-muted bg-[rgba(147,51,234,0.12)] px-2.5 py-0.5 rounded-full">
            {character.age}
          </span>
        </div>

        <span className={`inline-block w-fit text-xs font-semibold bg-gradient-to-r ${character.gradient} bg-clip-text text-transparent uppercase tracking-wide`}>
          {character.specialty}
        </span>

        <p className="text-sm text-text-muted leading-relaxed flex-1">{character.bio}</p>

        <a
          href={`/chat/${character.id}`}
          className="btn-gradient text-white font-semibold py-2.5 rounded-full text-center mt-auto text-sm tracking-wide"
        >
          Chat Now
        </a>
      </div>
    </div>
  );
}
