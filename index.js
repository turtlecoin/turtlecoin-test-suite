// Copyright (c) 2018, Brandon Lehmann, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.

'use strict'

const TurtleCoind = require('turtlecoin-rpc').TurtleCoind
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
  var ip, port, daemon

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
    console.log('')
    console.log(`Starting tests against ${ip}:${port}...\n`)
    return checkPass(daemon.getInfo())
  }).then((result) => {
    console.log(`getinfo                       passing: ${result.pass}     ${(result.pass && result.info.version) ? result.info.version : 'unknown'}`)
    return checkPass(daemon.getHeight())
  }).then((result) => {
    console.log(`getheight                     passing: ${result.pass}     ${(result.pass && result.info.height) ? result.info.height : 'unknown'}`)
    return checkPass(daemon.feeInfo())
  }).then((result) => {
    console.log(`feeinfo                       passing: ${result.pass}     ${(result.pass && result.info.status) ? result.info.status : 'unknown'}`)
    return checkPass(daemon.getPeers())
  }).then((result) => {
    console.log(`getpeers                      passing: ${result.pass}     ${(result.pass && result.info.peers) ? result.info.peers.length : 'unknown'}`)
    return checkPass(daemon.getCurrencyId())
  }).then((result) => {
    console.log(`getcurrencyid                 passing: ${result.pass}     ${(result.pass && result.info.length > 0) ? result.info : 'unknown'}`)
    return checkPass(daemon.getBlockHeaderByHeight({height: 2}))
  }).then((result) => {
    console.log(`getblockheaderbyheight        passing: ${result.pass}     ${(result.pass && result.info.hash) ? result.info.hash : 'unknown'}`)
    return checkPass(daemon.getBlockHeaderByHash({hash: '2ef060801dd27327533580cfa538849f9e1968d13418f2dd2535774a8c494bf4'}))
  }).then((result) => {
    console.log(`getblockheaderbyhash          passing: ${result.pass}     ${(result.pass && result.info.height) ? result.info.height : 'unknown'}`)
    return checkPass(daemon.getLastBlockHeader())
  }).then((result) => {
    console.log(`getlastblockheader            passing: ${result.pass}     ${(result.pass && result.info.hash) ? result.info.hash : 'unknown'}`)
    return checkPass(daemon.getBlockTemplate({walletAddress: 'TRTLuxN6FVALYxeAEKhtWDYNS9Vd9dHVp3QHwjKbo76ggQKgUfVjQp8iPypECCy3MwZVyu89k1fWE2Ji6EKedbrqECHHWouZN6g', reserveSize: 200}))
  }).then((result) => {
    console.log(`getblocktemplate              passing: ${result.pass}     ${(result.pass && result.info.difficulty) ? result.info.difficulty : 'unknown'}`)
    return checkPass(daemon.getBlockHash({height: 2}))
  }).then((result) => {
    console.log(`on_getblockhash               passing: ${result.pass}     ${(result.pass && result.info) ? result.info : 'unknown'}`)
    return checkPass(daemon.getBlockCount())
  }).then((result) => {
    console.log(`getblockcount                 passing: ${result.pass}     ${(result.pass && result.info) ? result.info : 'unknown'}`)
    return checkPass(daemon.getTransactionPool())
  }).then((result) => {
    console.log(`f_on_transactions_pool_json   passing: ${result.pass}     ${(result.pass && result.info) ? result.info.length : 'unknown'}`)
    return checkPass(daemon.getTransaction({hash: '702ad5bd04b9eff14b080d508f69a320da1909e989d6c163c18f80ae7a5ab832'}))
  }).then((result) => {
    console.log(`f_transaction_json            passing: ${result.pass}     ${(result.pass && result.info.txDetails.hash) ? result.info.txDetails.hash : 'unknown'}`)
    return checkPass(daemon.getBlock({hash: '2ef060801dd27327533580cfa538849f9e1968d13418f2dd2535774a8c494bf4'}))
  }).then((result) => {
    console.log(`f_block_json                  passing: ${result.pass}     ${(result.pass && result.info.prev_hash) ? result.info.prev_hash : 'unknown'}`)
    return checkPass(daemon.getBlocks({height: 30}))
  }).then((result) => {
    console.log(`f_blocks_list_json            passing: ${result.pass}     ${(result.pass && result.info) ? result.info.length : 'unknown'}`)
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
