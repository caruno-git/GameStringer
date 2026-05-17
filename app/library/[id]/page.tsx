import GameDetailClient from '@/components/game-detail-client';

// Next 15 con `output: 'export'` richiede almeno un param generato in
// `generateStaticParams()`. In produzione Tauri si usa il pattern query-param
// /library?id=X — questa cartella resta solo per non spaccare i link legacy.
// Generiamo un singolo placeholder che soddisfa il requirement; il componente
// client recupera l'id reale via useParams a runtime.
export function generateStaticParams() {
  return [{ id: '_' }];
}
export const dynamicParams = false;

export default function GameDetailPage() {
  return <GameDetailClient />;
}
