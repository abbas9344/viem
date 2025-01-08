import { beforeEach, expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import { getTransactionReceipt, mine, reset } from '../../actions/index.js'
import { optimism } from '../../op-stack/chains.js'
import { finalizeWithdrawal } from './finalizeWithdrawal.js'

const client = anvilMainnet.getClient()

const withdrawal = {
  nonce:
    1766847064778384329583297500742918515827483896875618958121606201292631377n,
  sender: '0x4200000000000000000000000000000000000007',
  target: '0x25ace71c97B33Cc4729CF772ae268934F7ab5fA1',
  value: 88196830953025947900n,
  gasLimit: 287624n,
  data: '0xd764ad0b0001000000000000000000000000000000000000000000000000000000002d51000000000000000000000000420000000000000000000000000000000000001000000000000000000000000099c9fc46f92e8a1c0dec1b1747d010903e884be1000000000000000000000000000000000000000000000004c7fa16770649c8fc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000a41635f5fd000000000000000000000000160d7aa81e6fc30210aeb915c3bb1f55bfa86b37000000000000000000000000160d7aa81e6fc30210aeb915c3bb1f55bfa86b37000000000000000000000000000000000000000000000004c7fa16770649c8fc0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  withdrawalHash:
    '0x539dfd84b3939c6d2f61e1fbaa176a70e6a433e222093c3fea872ac36527d6ac',
} as const

beforeEach(async () => {
  await reset(client, {
    blockNumber: 16280770n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
})

test('default', async () => {
  const hash = await finalizeWithdrawal(client, {
    account: accounts[0].address,
    targetChain: optimism,
    withdrawal,
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })
  expect(receipt.status).toEqual('success')
})

test('args: chain (nullish)', async () => {
  const hash = await finalizeWithdrawal(client, {
    account: accounts[0].address,
    chain: null,
    targetChain: optimism,
    withdrawal,
    gas: 420_000n,
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })
  expect(receipt.status).toEqual('success')
})

test('args: gas', async () => {
  const hash = await finalizeWithdrawal(client, {
    account: accounts[0].address,
    targetChain: optimism,
    withdrawal,
    gas: 420_000n,
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })
  expect(receipt.status).toEqual('success')
})

test('args: gas (nullish)', async () => {
  const hash = await finalizeWithdrawal(client, {
    account: accounts[0].address,
    targetChain: optimism,
    withdrawal,
    gas: null,
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })
  expect(receipt.status).toEqual('success')
})

test('args: portal address', async () => {
  const hash = await finalizeWithdrawal(client, {
    account: accounts[0].address,
    withdrawal,
    gas: 420_000n,
    portalAddress: optimism.contracts.portal[1].address,
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })
  expect(receipt.status).toEqual('success')
})

test('args: proof submitter', async () => {
  // TODO: migrate the rest of the test suite to a block with fault proofs
  // Sample withdrawal with fault proofs: https://optimistic.etherscan.io/tx/0x039d2fdf3161910cb667ed599a0a899314bd5041797b6707ba312792b6d43b5c
  await reset(client, {
    blockNumber: 21165285n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })

  const proofSubmitter = '0xD15F47c16BD277ff2dee6a0bD4e418165231CB69'
  const withdrawal = {
    nonce:
      1766847064778384329583297500742918515827483896875618958121606201292641117n,
    sender: '0x4200000000000000000000000000000000000007',
    target: '0x25ace71c97B33Cc4729CF772ae268934F7ab5fA1',
    value: 0n,
    gasLimit: 3334219n,
    data: '0xd764ad0b0001000000000000000000000000000000000000000000000000000000005352000000000000000000000000136b1ec699c62b0606854056f02dc7bb80482d6300000000000000000000000039ea01a0298c315d149a490e34b59dbf2ec7e48f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002dc6c000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000064a6492fe27355534400000000000000000000000000000000000000000000000000000000000000000000000000000000d15f47c16bd277ff2dee6a0bd4e418165231cb6900000000000000000000000000000000000000000000002e9ee5c38653f0000000000000000000000000000000000000000000000000000000000000',
    withdrawalHash:
      '0xD55C5BA792D04BC45656D5115F98A4AE446F66C857A41B6666C045023B7EBDB7',
  } as const

  const hash = await finalizeWithdrawal(client, {
    account: accounts[0].address,
    targetChain: optimism,
    withdrawal,
    proofSubmitter, // on behalf of the proof submittor
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })
  expect(receipt.status).toEqual('success')
})

test('error: small gas', async () => {
  await expect(() =>
    finalizeWithdrawal(client, {
      account: accounts[0].address,
      targetChain: optimism,
      withdrawal,
      gas: 69n,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: Transaction creation failed.

    URL: http://localhost
    Request body: {"method":"eth_estimateGas","params":[{"data":"0x8c3152e900000000000000000000000000000000000000000000000000000000000000200001000000000000000000000000000000000000000000000000000000002d51000000000000000000000000420000000000000000000000000000000000000700000000000000000000000025ace71c97b33cc4729cf772ae268934f7ab5fa1000000000000000000000000000000000000000000000004c7fa16770649c8fc000000000000000000000000000000000000000000000000000000000004638800000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001a4d764ad0b0001000000000000000000000000000000000000000000000000000000002d51000000000000000000000000420000000000000000000000000000000000001000000000000000000000000099c9fc46f92e8a1c0dec1b1747d010903e884be1000000000000000000000000000000000000000000000004c7fa16770649c8fc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000a41635f5fd000000000000000000000000160d7aa81e6fc30210aeb915c3bb1f55bfa86b37000000000000000000000000160d7aa81e6fc30210aeb915c3bb1f55bfa86b37000000000000000000000000000000000000000000000004c7fa16770649c8fc000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","from":"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266","gas":"0x45","to":"0xbEb5Fc579115071764c7423A4f12eDde41f106Ed"}]}
     
    Estimate Gas Arguments:
      from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:    0xbEb5Fc579115071764c7423A4f12eDde41f106Ed
      data:  0x8c3152e900000000000000000000000000000000000000000000000000000000000000200001000000000000000000000000000000000000000000000000000000002d51000000000000000000000000420000000000000000000000000000000000000700000000000000000000000025ace71c97b33cc4729cf772ae268934f7ab5fa1000000000000000000000000000000000000000000000004c7fa16770649c8fc000000000000000000000000000000000000000000000000000000000004638800000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001a4d764ad0b0001000000000000000000000000000000000000000000000000000000002d51000000000000000000000000420000000000000000000000000000000000001000000000000000000000000099c9fc46f92e8a1c0dec1b1747d010903e884be1000000000000000000000000000000000000000000000004c7fa16770649c8fc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000a41635f5fd000000000000000000000000160d7aa81e6fc30210aeb915c3bb1f55bfa86b37000000000000000000000000160d7aa81e6fc30210aeb915c3bb1f55bfa86b37000000000000000000000000000000000000000000000004c7fa16770649c8fc000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
      gas:   69
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  finalizeWithdrawalTransaction((uint256 nonce, address sender, address target, uint256 value, uint256 gasLimit, bytes data))
      args:                                   ({"nonce":"1766847064778384329583297500742918515827483896875618958121606201292631377","sender":"0x4200000000000000000000000000000000000007","target":"0x25ace71c97B33Cc4729CF772ae268934F7ab5fA1","value":"88196830953025947900","gasLimit":"287624","data":"0xd764ad0b0001000000000000000000000000000000000000000000000000000000002d51000000000000000000000000420000000000000000000000000000000000001000000000000000000000000099c9fc46f92e8a1c0dec1b1747d010903e884be1000000000000000000000000000000000000000000000004c7fa16770649c8fc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000a41635f5fd000000000000000000000000160d7aa81e6fc30210aeb915c3bb1f55bfa86b37000000000000000000000000160d7aa81e6fc30210aeb915c3bb1f55bfa86b37000000000000000000000000000000000000000000000004c7fa16770649c8fc0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","withdrawalHash":"0x539dfd84b3939c6d2f61e1fbaa176a70e6a433e222093c3fea872ac36527d6ac"})
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/estimateContractGas
    Details: Out of gas: gas required exceeds allowance: 69
    Version: viem@x.y.z]
  `)
})
