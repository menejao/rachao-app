import type { JogadorSummary } from "@rachao/types";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";

export function PlayerTable({
  players,
  turmaNameMap,
}: {
  players: JogadorSummary[];
  turmaNameMap: Map<string, string>;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <thead>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Turma</TableHead>
            <TableHead>Posicao</TableHead>
            <TableHead className="text-right">Nivel</TableHead>
            <TableHead>Presenca</TableHead>
            <TableHead>Mensalidade</TableHead>
          </TableRow>
        </thead>
        <tbody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="font-medium text-white">{player.nome}</TableCell>
              <TableCell>{turmaNameMap.get(player.turmaId) ?? "-"}</TableCell>
              <TableCell>{player.posicao}</TableCell>
              <TableCell className="text-right font-black text-white">{player.nivel}</TableCell>
              <TableCell>{player.ativo ? "Bom historico" : "Inativo"}</TableCell>
              <TableCell>{player.ativo ? "Em dia" : "-"}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
