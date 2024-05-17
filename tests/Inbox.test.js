const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const {interface, bytecode} = require('../compile');

const web3 = new Web3(ganache.provider());

const initialMessage = 'hey nigga';

let accounts;
let inbox;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    inbox = await (new web3.eth.Contract(JSON.parse(interface)))
        .deploy({data: bytecode, arguments: [ initialMessage ]})
        .send({from: accounts[0], gas: '1000000'});
});


describe('Inbox', () => {
    it('deploys a contract', () => {
        assert.ok(inbox.options.address);
        console.log(inbox.options.address);
    })

    it('has a default message', async () => {
        const message = await inbox.methods.message().call();
        assert.strictEqual(message, initialMessage);
    });

    it('can change message', async () => {
        const newMessage = 'bye nigga';
        const receipt = await inbox.methods.setMessage(newMessage).send({from: accounts[0]});
        console.log(receipt);

        const currentMessage = await inbox.methods.message().call();
        console.log(currentMessage);

        assert.strictEqual(currentMessage, newMessage);
    })
});