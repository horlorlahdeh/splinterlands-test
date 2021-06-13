const express = require("express");
const router = express.Router();
const { Hive } = require("@splinterlands/hive-interface");


// Custom Dependencies
const config = require("../utils/config");
const hive = new Hive();


// Intantiate the maps to receive data once stream method executes
const operations = new Map();
const playerOperations = new Map();
const players = new Map();

hive.stream({
  on_op: onOperation,
  save_state: () => null,
  load_state: () => null,
});
 
function onOperation(
  op,
  block_num,
  block_id,
  previous,
  transaction_id,
  block_time
) {
  // console.log(op)
  // Filter out any operations not related to Splinterlands
  if (op[0] != "custom_json" || !op[1].id.startsWith(config.operation_prefix))
    return;
  // Construct new data object
  const newData = {
    op_type: op[1].id,
    trx_player_name: op[1].required_posting_auths[0],
    trx_time: block_time,
    trx_block_num: block_num,
    trx_id: transaction_id,
  };

  // Add data into created operations array
  if (operations.has(newData.op_type)) {
    count = operations.get(newData.op_type);
    count++;
    operations.set(newData.op_type, count);
  } else {
    operations.set(newData.op_type, 1);
  }
  // Add data into created player operations array
  if (playerOperations.has(newData.trx_player_name)) {
    userOps = playerOperations.get(newData.trx_player_name);
    userOps.push(newData);
    playerOperations.set(newData.trx_player_name, userOps);
  } else {
    dat = new Array();
    dat.push(newData);
    // Some data here still returns undefined from the stream
    playerOperations.set(newData.trx_player_name, dat);
  }
  // Add data into created player array
  if (players.has(newData.trx_player_name)) {
    count = players.get(newData.trx_player_name);
    count++;
    players.set(newData.trx_player_name, count);
  } else {
    players.set(newData.trx_player_name, 1);
  }
  
}

router.get("/", (req, res, next) => {
  var operationsObject = Object.fromEntries(operations);
  var playersObject = Object.fromEntries(players);
  var playerOperationsObject = Object.fromEntries(playerOperations);
  var loading;
  // Set Page Loader
  if (operations.size < 1) {
    loading = true;
  } else {
    loading = false;
  }
  res.render("index", {
    operations: operationsObject,
    player_operation: playerOperationsObject,
    players: playersObject,
    loading: loading,
  });
});
router.get("/operation/:player", function (req, res, next) {
  const player = req.params.player;

  if (playerOperations.has(player)) {
    const playerOperation = playerOperations.get(player);
    const data = {
      operations: playerOperation,
    };
    res.json(JSON.stringify(data));
  } else {
    data = {
      operations: "",
    };
    res.json(JSON.stringify(data));
  }
});
router.get("/operation", async function (req, res, next) {
  
    const playerOperation = Object.fromEntries(playerOperations);
    let usableData = []
    

    const data = {
      operations: playerOperation,
    };
    console.log(data)
    res.json(JSON.stringify(data));
  
});

// To implement for each player trx route
router.get(`/information/:player`, (req, res, next) => {
  const player = req.query.player;
  res.render("player", { user: player });
});
module.exports = router; 
