from fastapi import FastAPI
from pydantic import BaseModel
import subprocess
import os
import json
import glob
from pathlib import Path

app = FastAPI()

class FullBenchRequest(BaseModel):
    n_per_size: str = "5"
    batches: str = "16"
    threads: str = "4"
    warmup_docs: str = "5"

@app.post("/execute_full_pipeline")
async def execute_full_pipeline(req: FullBenchRequest):
    # Caminho para o script na raiz da PoC
    script_path = "./scripts/run_all.sh"
    
    # Monta os argumentos para o shell script
    # Pulamos sync e python install porque já preparamos o ambiente manual
    command = [
        "bash", script_path,
        "--n-per-size", req.n_per_size,
        "--batches", req.batches,
        "--threads", req.threads,
        "--warmup-docs", req.warmup_docs,
        "--skip-sync",
        "--skip-python"
    ]

    print(f"Executando Pipeline Completa: {' '.join(command)}")
    
    try:
        # Executa o script e espera terminar
        process = subprocess.run(command, capture_output=True, text=True, check=True)
        
        # O seu script gera resultados em results/<TIMESTAMP>/run.jsonl
        # Vamos buscar o arquivo mais recente gerado
        list_of_files = glob.glob('results/*/run.jsonl')
        latest_file = max(list_of_files, key=os.path.getctime)
        
        # Lê a última linha do log gerado (o resultado do benchmark)
        with open(latest_file, 'r') as f:
            lines = f.readlines()
            last_run_metrics = json.loads(lines[-1])

        return {
            "status": "success",
            "metrics": last_run_metrics,
            "log": "Pipeline executada com sucesso"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)