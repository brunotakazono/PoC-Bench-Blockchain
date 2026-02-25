'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const http = require('http');

class ConfidentialWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }

    async submitTransaction() {
        // Configuração da carga pesada da matriz
        const postData = JSON.stringify({
            n_per_size: "24",     // Mantendo sua carga original
            batches: "4 8 16",    // Matriz completa
            threads: "4",         // Ajustado para estabilidade
            warmup_docs: "32"     // Warm-up original
        });

        // 1. Chamada para a API FastAPI que gerencia o run_all.sh
        const aiResponse = await new Promise((resolve, reject) => {
            const req = http.request({
                hostname: '127.0.0.1',
                port: 8000,
                path: '/execute_full_pipeline',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length
                },
                timeout: 36000000 // Timeout de 10 horas no socket para evitar quedas
            }, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve({ status: 'error', message: 'Falha ao processar JSON da API' });
                    }
                });
            });

            // Removidas as mensagens de erro (console.error) para limpar o terminal
            req.on('error', (e) => {
                reject(e); 
            });

            req.write(postData);
            req.end();
        });

        // 2. Preparação dos dados para o Hyperledger Fabric
        // Se a API falhar, enviamos valores padrão para não travar o Caliper
        const m = aiResponse.metrics || {};
        const assetID = `RUN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        await this.sutAdapter.sendRequests({
            contractId: 'basic',
            contractFunction: 'CreateAsset',
            invokerIdentity: 'User1',
            contractArguments: [
                assetID,
                m.model_id || 'BGE-M3',
                (m.docs_per_sec || 0).toString(),
                (m.rss_peak_mb || 0).toString(), // Memória RAM consumida
                (m.p95_ms || 0).toString()       // Latência P95 da matriz
            ],
            readOnly: false
        });
    }
}

function createWorkloadModule() {
    return new ConfidentialWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
