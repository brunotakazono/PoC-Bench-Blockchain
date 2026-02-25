'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
    async submitTransaction() {
        const assetID = `Asset_${Math.random()}`;
        await this.sutAdapter.sendRequests({
            contractId: 'basic',
            contractFunction: 'CreateAsset',
            invokerIdentity: 'User1',
            contractArguments: [assetID, 'blue', '20', 'Takazono', '500'],
            readOnly: false
        });
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
