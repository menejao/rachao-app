"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jogador_service_test_1 = require("./modules/jogadores/jogador.service.test");
const job_service_test_1 = require("./modules/jobs/job.service.test");
const pagamento_service_test_1 = require("./modules/pagamentos/pagamento.service.test");
const presenca_service_test_1 = require("./modules/presencas/presenca.service.test");
const time_service_test_1 = require("./modules/times/time.service.test");
const turma_service_test_1 = require("./modules/turmas/turma.service.test");
(async () => {
    await (0, turma_service_test_1.runTurmaServiceTests)();
    await (0, jogador_service_test_1.runJogadorServiceTests)();
    await (0, job_service_test_1.runJobServiceTests)();
    await (0, pagamento_service_test_1.runPagamentoServiceTests)();
    await (0, time_service_test_1.runTimeServiceTests)();
    await (0, presenca_service_test_1.runPresencaServiceTests)();
    console.log("api tests passed");
})();
