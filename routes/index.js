const express = require("express");
const router = express.Router();
const { Hive } = require("@splinterlands/hive-interface");
const { json } = require("express");

// Custom Dependencies
const config = require("../utils/config");
const hive = new Hive();

// Necessary Globals
const name = "Isreal Ololade";

// Intantiate the array to receive data once stream function executes
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
    playerOperations.set(newData.trx_player_name, dat);
  }
  // Add data into created player array
  //TODO: Undefined is getting into this model, figure out why
  if (players.has(newData.trx_player_name)) {
    count = players.get(newData.trx_player_name);
    count++;
    players.set(newData.trx_player_name, count);
  } else {
    players.set(newData.trx_player_name, 1);
  }
  //   console.log(playerOperations);
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
  console.log(playerOperationsObject);
  res.render("index", {
    operations: operationsObject,
    player_operation: playerOperationsObject,
    players: playersObject,
    name: name,
    loading: loading,
  });
});
router.get("/operation/:userName", function (req, res, next) {
  const player = req.params.userName;
  

  if (playerOperations.has(player)) {
    const userOperations = playerOperations.get(player);
    const data = {
      operations: userOperations,
    };
    res.json(JSON.stringify(data));
  } else {
    data = {
      operations: "",
    };
    res.json(JSON.stringify(data));
  }
});
router.get(`/information/:player`, (req, res, next) => {
  const player = req.query.player;
  res.render('player', {user: player})
  
});
module.exports = router;
