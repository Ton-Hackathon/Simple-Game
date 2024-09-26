import { toNano } from '@ton/core';
import { ExpRegistry } from '../wrappers/ExpRegistry';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const expRegistry = provider.open(await ExpRegistry.fromInit(BigInt(Math.floor(Math.random() * 10000))));

    await expRegistry.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(expRegistry.address);

    console.log('ID', await expRegistry.getId());
}
