import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Test } from '../wrappers/Test';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Test', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Test');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let test: SandboxContract<Test>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        test = blockchain.openContract(
            Test.createFromConfig(
                {
                    id: 0,
                    counter: 0,
                },
                code
            )
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await test.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: test.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and test are ready to use
    });

    it('should increase counter', async () => {
        const increaseTimes = 3;
        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const increaser = await blockchain.treasury('increaser' + i);

            const counterBefore = await test.getCounter();

            console.log('counter before increasing', counterBefore);

            const increaseBy = Math.floor(Math.random() * 100);

            console.log('increasing by', increaseBy);

            const increaseResult = await test.sendIncrease(increaser.getSender(), {
                increaseBy,
                value: toNano('0.05'),
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: increaser.address,
                to: test.address,
                success: true,
            });

            const counterAfter = await test.getCounter();

            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }
    });
});
