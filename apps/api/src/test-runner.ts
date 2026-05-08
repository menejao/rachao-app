import { runJogadorServiceTests } from "./modules/jogadores/jogador.service.test";
import { runJobServiceTests } from "./modules/jobs/job.service.test";
import { runPagamentoServiceTests } from "./modules/pagamentos/pagamento.service.test";
import { runPresencaServiceTests } from "./modules/presencas/presenca.service.test";
import { runTimeServiceTests } from "./modules/times/time.service.test";
import { runTurmaServiceTests } from "./modules/turmas/turma.service.test";

(async () => {
  await runTurmaServiceTests();
  await runJogadorServiceTests();
  await runJobServiceTests();
  await runPagamentoServiceTests();
  await runTimeServiceTests();
  await runPresencaServiceTests();
  console.log("api tests passed");
})();
