const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const {interface, bytecode} = require('../compile');

const web3 = new Web3(ganache.provider());

const minGweiToEnter = 5;

let accounts;
let lottery;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await (new web3.eth.Contract(JSON.parse(interface)))
        .deploy({data: bytecode, arguments: [minGweiToEnter]})
        .send({from: accounts[0], gas: '1000000'});
});


describe('Lottery', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
        console.log(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(1, players.length);
    });

    it('allows multiple accounts to enter', async () => {

        const testAccounts = accounts.slice(3, 6);

        for (let account of testAccounts) {
            await lottery.methods.enter().send({
                from: account,
                value: web3.utils.toWei(String(0.02), 'ether'),
            });
        }
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(testAccounts.length, players.length);
        for (let player of players) {
            assert.strictEqual(true, testAccounts.includes(player));
        }
    });

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 50000, // wei
            });
            assert(false);
        } catch (e) {
            // checking if error really occured
            assert(e);
        }

        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei(minGweiToEnter.toString(), 'gwei'),
        });

        assert(true);
    });

    it('only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[2]
            });

            assert(false);
        } catch (e) {
            assert(e);
        }
    })
});