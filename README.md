# PoC Computação Confidencial – Hyperledger Fabric + Caliper

Este repositório contém uma **Prova de Conceito (PoC)** para executar benchmarks em uma rede Hyperledger Fabric utilizando o [Hyperledger Caliper](https://hyperledger.github.io/caliper/).

---

## Índice

- [Pré-requisitos](#pré-requisitos)  
  - [1️⃣ Preparar ambiente e dependências](#1️⃣-preparar-ambiente-e-dependências)  
  - [2️⃣ Baixar e subir a rede Hyperledger Fabric](#2️⃣-baixar-e-subir-a-rede-hyperledger-fabric)
  - [3️⃣ Configurar Hyperledger Caliper](#3️⃣-configurar-hyperledger-caliper)
  - [4️⃣ Configurar os scripts do Leo seguindo o tutorial até o 2](#4️⃣-configurar-os-scripts-do-leo-seguindo-o-tutorial-até-o-2)
  - [5️⃣ Rodar benchmarks](#5️⃣-rodar-benchmarks)

---

## Pré-requisitos

- Ubuntu 20.04 ou superior  
- [Node.js 22](https://github.com/nvm-sh/nvm) (via NVM)  
- Docker & Docker Compose  
- Python 3.x  
- Go 1.20+  

---

## Passos rápidos 

### 1️⃣ Preparar ambiente e dependências

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git make python3 g++ software-properties-common apt-transport-https ca-certificates jq docker.io
sudo usermod -aG docker $USER && newgrp docker
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22 && nvm use 22
sudo add-apt-repository ppa:longsleep/golang-backports -y
sudo apt update
sudo apt install golang-go -y
go version
```

### 2️⃣ Baixar e subir a rede Hyperledger Fabric

```bash
mkdir ~/hyperledger && cd ~/hyperledger
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh
chmod +x install-fabric.sh
./install-fabric.sh docker samples binary

cd fabric-samples/test-network
./network.sh up createChannel -c mychannel -ca
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-go/ -ccl go
```

### 3️⃣ Configurar Hyperledger Caliper

```bash
mkdir ~/caliper && cd ~/caliper
npm init -y
npm install --only=prod @hyperledger/caliper-cli@0.7.1
npx caliper bind --caliper-bind-sut fabric:2.4
```

### 4️⃣ configurar os scritps do Leo seguindo o tutorial até o 2
https://github.com/lsfoschine/PoC_Computacao_Confidencial/blob/main/README.md

### 5️⃣ Rodar benchmarks

#### Terminal 1 – API de benchmark

```bash
cd ~/hyperledger/PoC_Computacao_Confidencial
chmod +x scripts/*.sh
uv run python src/api_benchmark.py
```
#### Terminal 2 – Caliper

```bash
cd ~/caliper
npx caliper launch manager \
    --caliper-workspace ./ \
    --caliper-networkconfig network-config.yaml \
    --caliper-benchconfig bench-config.yaml \
    --caliper-flow-only-test
```
