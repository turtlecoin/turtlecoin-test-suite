#!/usr/bin/env node

// Copyright (c) 2018, Brandon Lehmann, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.

'use strict'

const seedNode = 'https://api.turtlenode.io/seed.turtlenode.io/getinfo'
const request = require('request-promise-native')
const TurtleCoind = require('turtlecoin-rpc').TurtleCoind
const Client = require('turtlecoin-rpc').Client
const TurtleService = require('turtlecoin-rpc').Service
const info = require('./package.json')
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'TurtleCoin> '
})

console.log('\n\n',
  '████████╗██╗  ██╗██████╗ ████████╗██╗    ██████╗ █████╗ █████╗ ██╗███╗   ██╗\n',
  '╚══██╔══╝██║  ██║██╔══██╗╚══██╔══╝██║    ██╔═══╝██╔═══╝██╔══██╗██║████╗  ██║\n',
  '   ██║   ██║  ██║██████╔╝   ██║   ██║    ████╗  ██║    ██║  ██║██║██╔██╗ ██║\n',
  '   ██║   ██║  ██║██╔══██╗   ██║   ██║    ██╔═╝  ██║    ██║  ██║██║██║╚██╗██║\n',
  '   ██║   ╚█████╔╝██║  ██║   ██║   ██████╗██████╗╚█████╗╚█████╔╝██║██║ ╚████║\n',
  '   ╚═╝    ╚════╝ ╚═╝  ╚═╝   ╚═╝   ╚═════╝╚═════╝ ╚════╝ ╚════╝ ╚═╝╚═╝  ╚═══╝\n')

console.log(`                        TurtleCoin Test Suite v${info.version}\n`)
console.log(`               By: ${info.author}`)
console.log(`                   Open Sourced Under ${info.license} since 2018`)
console.log('')
console.log('             Type "help" for information on available commands\n\n')

function question (string) {
  return new Promise((resolve, reject) => {
    rl.question(string, (answer) => {
      return resolve(answer.trim())
    })
  })
}

function checkPass (func) {
  return new Promise((resolve, reject) => {
    func.then((result) => {
      return resolve({pass: true, info: result})
    }).catch(() => {
      return resolve({pass: false, info: {}})
    })
  })
}

function getSeedInfo () {
  return new Promise((resolve, reject) => {
    request({
      url: seedNode,
      json: true
    }).then((info) => {
      return resolve({pass: true, info: info})
    }).catch(() => {
      return resolve({pass: false, info: {}})
    })
  })
}

function daemonTests () {
  var ip, port, daemon, client, seedInfo
  var lastblockhash = '2ef060801dd27327533580cfa538849f9e1968d13418f2dd2535774a8c494bf4'

  console.log('')
  question('What is the address of the daemon you would like to test? [127.0.0.1] ').then((daemonIp) => {
    ip = (daemonIp.length > 0) ? daemonIp : '127.0.0.1'
    return question('What is the port number of the daemon you would like to test? [11898] ')
  }).then((daemonPort) => {
    port = (daemonPort.length > 0) ? daemonPort : 11898
    daemon = new TurtleCoind({
      host: ip,
      port: port
    })
    client = new Client({
      host: ip,
      port: port
    })
    console.log('')
    console.log(`Attempting to retrieve information from seed node...`)
    return getSeedInfo()
  }).then((result) => {
    console.log('')
    if (result.pass) {
      seedInfo = result.info
      console.log(`Information retrieved from seed node. Height: ${seedInfo.height}, Difficulty: ${seedInfo.difficulty}, Hashrate: ${seedInfo.hashrate}`)
    } else {
      console.log(`Could not retrieve information from seed node. Continuing without...`)
    }
    console.log('')
    console.log(`Starting tests against ${ip}:${port}...\n`)
    return checkPass(daemon.getInfo())
  }).then((result) => {
    console.log(`getinfo                               passing: ${result.pass}     ${(result.pass && result.info.version) ? result.info.version : 'unknown'}`)
    if (result.pass && seedInfo.height && result.info.synced && seedInfo.synced) {
      var matchHeight = (seedInfo.height === result.info.height)
      var matchDifficulty = (seedInfo.difficulty === result.info.difficulty)
      console.log(`  - height match                      passing: ${matchHeight}`)
      console.log(`  - difficulty match                  passing: ${matchDifficulty}`)
    } else {
      console.log(`  - height match                      passing: skipped`)
      console.log(`  - difficulty match                  passing: skipped`)
    }
    return checkPass(daemon.getHeight())
  }).then((result) => {
    console.log(`getheight                             passing: ${result.pass}     ${(result.pass && result.info.height) ? result.info.height : 'unknown'}`)
    return checkPass(daemon.feeInfo())
  }).then((result) => {
    console.log(`feeinfo                               passing: ${result.pass}     ${(result.pass && result.info.status) ? result.info.status : 'unknown'}`)
    return checkPass(daemon.getPeers())
  }).then((result) => {
    console.log(`getpeers                              passing: ${result.pass}     ${(result.pass && result.info.peers) ? result.info.peers.length : 'unknown'}`)
    return checkPass(daemon.getCurrencyId())
  }).then((result) => {
    console.log(`getcurrencyid                         passing: ${result.pass}     ${(result.pass && result.info.length > 0) ? result.info : 'unknown'}`)
    return checkPass(daemon.getBlockHeaderByHeight({height: 2}))
  }).then((result) => {
    console.log(`getblockheaderbyheight                passing: ${result.pass}     ${(result.pass && result.info.hash) ? result.info.hash : 'unknown'}`)
    return checkPass(daemon.getBlockHeaderByHash({hash: '2ef060801dd27327533580cfa538849f9e1968d13418f2dd2535774a8c494bf4'}))
  }).then((result) => {
    console.log(`getblockheaderbyhash                  passing: ${result.pass}     ${(result.pass && result.info.height) ? result.info.height : 'unknown'}`)
    return checkPass(daemon.getLastBlockHeader())
  }).then((result) => {
    if (result.pass && result.info.hash) lastblockhash = result.info.hash
    console.log(`getlastblockheader                    passing: ${result.pass}     ${(result.pass && result.info.hash) ? result.info.hash : 'unknown'}`)
    return checkPass(daemon.getBlockTemplate({walletAddress: 'TRTLuxN6FVALYxeAEKhtWDYNS9Vd9dHVp3QHwjKbo76ggQKgUfVjQp8iPypECCy3MwZVyu89k1fWE2Ji6EKedbrqECHHWouZN6g', reserveSize: 200}))
  }).then((result) => {
    console.log(`getblocktemplate                      passing: ${result.pass}     ${(result.pass && result.info.difficulty) ? result.info.difficulty : 'unknown'}`)
    return checkPass(daemon.getBlockHash({height: 2}))
  }).then((result) => {
    console.log(`on_getblockhash                       passing: ${result.pass}     ${(result.pass && result.info) ? result.info : 'unknown'}`)
    return checkPass(daemon.getBlockCount())
  }).then((result) => {
    console.log(`getblockcount                         passing: ${result.pass}     ${(result.pass && result.info) ? result.info : 'unknown'}`)
    return checkPass(daemon.getTransactionPool())
  }).then((result) => {
    console.log(`f_on_transactions_pool_json           passing: ${result.pass}     ${(result.pass && result.info) ? result.info.length : 'unknown'}`)
    return checkPass(daemon.getTransaction({hash: '702ad5bd04b9eff14b080d508f69a320da1909e989d6c163c18f80ae7a5ab832'}))
  }).then((result) => {
    console.log(`f_transaction_json                    passing: ${result.pass}     ${(result.pass && result.info.txDetails.hash) ? result.info.txDetails.hash : 'unknown'}`)
    return checkPass(daemon.getBlock({hash: '2ef060801dd27327533580cfa538849f9e1968d13418f2dd2535774a8c494bf4'}))
  }).then((result) => {
    console.log(`f_block_json                          passing: ${result.pass}     ${(result.pass && result.info.prev_hash) ? result.info.prev_hash : 'unknown'}`)
    return checkPass(daemon.getBlocks({height: 30}))
  }).then((result) => {
    console.log(`f_blocks_list_json                    passing: ${result.pass}     ${(result.pass && result.info) ? result.info.length : 'unknown'}`)
    return checkPass(client.queryBlocksLite({blockHashes: ['2ef060801dd27327533580cfa538849f9e1968d13418f2dd2535774a8c494bf4']}))
  }).then((result) => {
    console.log(`queryblockslite                       passing: ${result.pass}     ${(result.pass && result.info.items) ? result.info.items.length : 'unknown'}`)
    return checkPass(client.getIndexes({transactionHash: '702ad5bd04b9eff14b080d508f69a320da1909e989d6c163c18f80ae7a5ab832'}))
  }).then((result) => {
    console.log(`get_o_indexes                         passing: ${result.pass}     ${(result.pass && result.info.o_indexes) ? result.info.o_indexes.length : 'unknown'}`)
    return checkPass(client.getRandomOutputs({amounts: [100, 1000], mixin: 3}))
  }).then((result) => {
    console.log(`getrandom_outs                        passing: ${result.pass}     ${(result.pass && result.info.outs) ? result.info.outs.length : 'unknown'}`)
    return checkPass(client.getPoolChanges({tailBlockHash: '2ef060801dd27327533580cfa538849f9e1968d13418f2dd2535774a8c494bf4', knownTransactionHashes: []}))
  }).then((result) => {
    console.log(`get_pool_changes                      passing: ${result.pass}     ${(result.pass && result.info.status) ? result.info.status : 'unknown - okay if failed'}`)
    return checkPass(client.getPoolChangesLite({tailBlockHash: '2ef060801dd27327533580cfa538849f9e1968d13418f2dd2535774a8c494bf4', knownTransactionHashes: []}))
  }).then((result) => {
    console.log(`get_pool_changes_lite                 passing: ${result.pass}     ${(result.pass && result.info.status) ? result.info.status : 'unknown - okay if failed'}`)
    return checkPass(client.getBlockDetailsByHeight({blockHeight: 2}))
  }).then((result) => {
    console.log(`get_block_details_by_height           passing: ${result.pass}     ${(result.pass && result.info.block) ? result.info.block.hash : 'unknown'}`)
    return checkPass(client.getBlocksDetailsByHeights({blockHeights: [2, 4, 6, 8]}))
  }).then((result) => {
    console.log(`get_blocks_details_by_heights         passing: ${result.pass}     ${(result.pass && result.info.blocks) ? result.info.blocks.length : 'unknown'}`)
    return checkPass(client.getBlocksDetailsByHashes({blockHashes: ['2ef060801dd27327533580cfa538849f9e1968d13418f2dd2535774a8c494bf4', lastblockhash]}))
  }).then((result) => {
    console.log(`get_blocks_details_by_hashes          passing: ${result.pass}     ${(result.pass && result.info.blocks) ? result.info.blocks.length : 'unknown'}`)
    return checkPass(client.getBlocksHashesByTimestamps({timestampBegin: 1531348100, seconds: 240}))
  }).then((result) => {
    console.log(`get_blocks_hashes_by_timestamps       passing: ${result.pass}     ${(result.pass && result.info.blockHashes) ? result.info.blockHashes.length : 'unknown'}`)
    return checkPass(client.getTransactionDetailsByHashes({transactionHashes: ['702ad5bd04b9eff14b080d508f69a320da1909e989d6c163c18f80ae7a5ab832']}))
  }).then((result) => {
    console.log(`get_transaction_details_by_hashes     passing: ${result.pass}     ${(result.pass && result.info.transactions) ? result.info.transactions.length : 'unknown'}`)
    return checkPass(client.getTransactionHashesByPaymentId({paymentId: '80ec855eef7df4bce718442cabe086f19dfdd0d03907c7768eddb8eca8c5a667'}))
  }).then((result) => {
    console.log(`get_transaction_hashes_by_payment_id  passing: ${result.pass}     ${(result.pass && result.info.transactionHashes) ? result.info.transactionHashes.length : 'unknown'}`)
  }).then(() => {
    console.log('')
    rl.prompt()
  })
}

function serviceTests () {
  var ip, port, password, service, address, tempaddress

  console.log('')
  question('What is the address of turtle-service you would like to test? [127.0.0.1] ').then((serviceIp) => {
    ip = (serviceIp.length > 0) ? serviceIp : '127.0.0.1'
    return question('What is the port number of turtle-service you would like to test? [8070] ')
  }).then((servicePort) => {
    port = (servicePort.length > 0) ? servicePort : 8070
    return question('What is the password of turtle-service you would like to test? [password] ')
  }).then((servicePassword) => {
    password = (servicePassword.length > 0) ? servicePassword : 'password'
    service = new TurtleService({
      host: ip,
      port: port,
      rpcPassword: password,
      defaultMixin: 3
    })

    console.log('')
    console.log(`Starting tests against ${ip}:${port}...\n`)

    return checkPass(service.getAddresses())
  }).then((result) => {
    if (result.pass && result.info.length > 0) address = result.info[0]
    console.log(`getAddresses                          passing: ${result.pass}        ${(result.pass && result.info.length > 0) ? result.info[0] : 'unknown'}`)
    return checkPass(service.getStatus())
  }).then((result) => {
    console.log(`getStatus                             passing: ${result.pass}        ${(result.pass && result.info.blockCount) ? result.info.blockCount : 'unknown'}`)
    return checkPass(service.getFeeInfo())
  }).then((result) => {
    console.log(`getFeeInfo                            passing: ${result.pass}        ${(result.pass && result.info.amount) ? result.info.amount : '0.00'}`)
    return checkPass(service.getViewKey())
  }).then((result) => {
    console.log(`getViewKey                            passing: ${result.pass}        ${(result.pass && result.info.viewSecretKey.length > 0) ? 'Hidden' : 'unknown'}`)
    return checkPass(service.getSpendKeys({address: address}))
  }).then((result) => {
    console.log(`getSpendKeys                          passing: ${result.pass}        ${(result.pass && result.info.spendPublicKey.length > 0) ? 'Hidden' : 'unknown'}`)
    return checkPass(service.getMnemonicSeed({address: address}))
  }).then((result) => {
    console.log(`getMnemonicSeed                       passing: ${result.pass}        ${(result.pass && result.info.length > 0) ? 'Hidden' : 'unknown'}`)
    return checkPass(service.createAddress())
  }).then((result) => {
    if (result.pass && result.info.length > 0) tempaddress = result.info
    console.log(`createAddress                         passing: ${result.pass}        ${(result.pass && result.info.length > 0) ? result.info : 'unknown'}`)
    return checkPass(service.deleteAddress({address: tempaddress}))
  }).then((result) => {
    console.log(`deleteAddress                         passing: ${result.pass}        ${(result.pass) ? 'OK' : 'unknown'}`)
    return checkPass(service.getBalance())
  }).then((result) => {
    console.log(`getBalance                            passing: ${result.pass}        ${(result.pass && result.info.availableBalance !== -1) ? result.info.availableBalance : 'unknown'}`)
    return checkPass(service.getBlockHashes({firstBlockIndex: 1, blockCount: 10}))
  }).then((result) => {
    console.log(`getBlockHashes                        passing: ${result.pass}        ${(result.pass && result.info.blockHashes) ? result.info.blockHashes.length : 'unknown'}`)
    return checkPass(service.getTransactionHashes({addresses: [address], firstBlockIndex: 1, blockCount: 10}))
  }).then((result) => {
    console.log(`getTransactionHashes                  passing: ${result.pass}        ${(result.pass && result.info) ? result.info.length : 'unknown'}`)
    return checkPass(service.getTransactions({addresses: [address], firstBlockIndex: 1, blockCount: 10}))
  }).then((result) => {
    console.log(`getTransactions                       passing: ${result.pass}        ${(result.pass && result.info) ? result.info.length : 'unknown'}`)
    return checkPass(service.getUnconfirmedTransactionHashes())
  }).then((result) => {
    console.log(`getUnconfirmedTransactionHashes       passing: ${result.pass}        ${(result.pass && result.info.transactionHashes) ? result.info.transactionHashes.length : 'unknown'}`)
    return checkPass(service.createIntegratedAddress({address: 'TRTLv1pacKFJk9QgSmzk2LJWn14JGmTKzReFLz1RgY3K9Ryn7783RDT2TretzfYdck5GMCGzXTuwKfePWQYViNs4avKpnUbrwfQ', paymentId: '80ec855eef7df4bce718442cabe086f19dfdd0d03907c7768eddb8eca8c5a667'}))
  }).then((result) => {
    console.log(`createIntegratedAddress               passing: ${result.pass}        ${(result.pass && result.info.length > 0) ? result.info : 'unknown'}`)
    return checkPass(service.save())
  }).then((result) => {
    console.log(`save                                  passing: ${result.pass}        ${(result.pass) ? 'OK' : 'unknown'}`)
  }).then(() => {
    console.log(`getTransaction                        passing: skipped`)
    console.log(`sendTransaction                       passing: skipped`)
    console.log(`createDelayedTransaction              passing: skipped`)
    console.log(`deleteDelayedTransaction              passing: skipped`)
    console.log(`sendDelayedTransaction                passing: skipped`)
    console.log(`sendFusionTransaction                 passing: skipped`)
    console.log(`estimateFusion                        passing: skipped`)
  }).then(() => {
    console.log('')
    rl.prompt()
  })
}

rl.on('line', (line) => {
  switch (line.trim().toLowerCase()) {
    case 'help':
      console.log('\nAvailable Commands\n')
      console.log('test daemon: tests daemon RPC calls to verify proper operation')
      console.log('test service: tests turtle-service RPC calls to verify proper operation')
      console.log('exit: exits the test suite software\n')
      break
    case 'test daemon':
      daemonTests()
      break
    case 'test service':
      serviceTests()
      break
    case 'exit':
      console.log('\nThanks for using the TurtleCoin Test Suite\n')
      process.exit()
    case '':
      break
    default:
      console.log('\nCommand not found. Please type "help" for information on avaiable commands')
      break
  }
  rl.prompt()
})

rl.prompt()
