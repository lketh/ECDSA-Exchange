const express = require("express");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const app = express();
const cors = require("cors");
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const balances = {};

for (let i = 0; i < 10; i++) {
  const key = ec.genKeyPair();
  balances[key.getPublic("hex")] = {
    privateKey: key.getPrivate("hex"),
    balance: 100,
  };
}

console.log(balances);

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address].balance || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { msg, msgHash, signature } = req.body;
  const key = ec.keyFromPublic(msg.sender, "hex");

  if (key.verify(msgHash, signature)) {
    balances[msg.sender].balance -= msg.amount;
    balances[msg.recipient].balance =
      (balances[msg.recipient].balance || 0) + +msg.amount;
    res.send({ balance: balances[msg.sender].balance });
  } else {
    res.status(400).send({ error: "Invalid signature", balance: 0 });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
