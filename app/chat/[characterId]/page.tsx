import { characters } from '@/lib/characters';
import { notFound } from 'next/navigation';
import ChatInterface from './ChatInterface';

export function generateStaticParams() {
  return characters.map((c) => ({ characterId: c.id }));
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ characterId: string }>;
}) {
  const { characterId } = await params;
  const character = characters.find((c) => c.id === characterId);
  if (!character) notFound();

  return <ChatInterface character={character} />;
}
