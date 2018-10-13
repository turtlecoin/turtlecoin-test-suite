#!/usr/bin/env node

// Copyright (c) 2018, Brandon Lehmann, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.

'use strict'

const TurtleCoind = require('turtlecoin-rpc').TurtleCoind
const Client = require('turtlecoin-rpc').Client
// const TurtleService = require('turtlecoin-rpc').Service
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

function daemonTests () {
  var ip, port, daemon, client
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
    console.log(`Starting tests against ${ip}:${port}...\n`)
    return checkPass(daemon.getInfo())
  }).then((result) => {
    console.log(`getinfo                               passing: ${result.pass}     ${(result.pass && result.info.version) ? result.info.version : 'unknown'}`)
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
    case 'exit':
      console.log('\nThanks for using the TurtleCoin Test Suite\n')
      process.exit()
    default:
      console.log('\nCommand not found. Please type "help" for information on avaiable commands')
      break
  }
  rl.prompt()
})

rl.prompt()
