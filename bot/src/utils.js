import { ethers } from "ethers";

// GM I hate JS
export const match = (a, b, caseIncensitive = true) => {
  if (a === null || a === undefined) return false;

  if (Array.isArray(b)) {
    if (caseIncensitive) {
      return b.map((x) => x.toLowerCase()).includes(a.toLowerCase());
    }

    return b.includes(a);
  }

  if (caseIncensitive) {
    return a.toLowerCase() === b.toLowerCase();
  }

  return a === b;
};

// JSON.stringify from ethers.BigNumber is pretty horrendous
// So we have a custom stringify function
// E.g., 
//    const bnArray = [ethers.BigNumber.from("1000000000000000000"), ethers.BigNumber.from("2000000000000000000")];
//    console.log(stringifyBN(bnArray)); // output: ["1000000000000000000", "2000000000000000000"]
export const stringifyBN = (o, toHex = false) => {
  if (o === null || o === undefined) {
    return o;
  } else if (typeof o == "bigint" || o.eq !== undefined) {
    if (toHex) {
      return o.toHexString();
    }
    return o.toString();
  } else if (Array.isArray(o)) {
    return o.map((x) => stringifyBN(x, toHex));
  } else if (typeof o == "object") {
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = stringifyBN(o[k], toHex);
    });
    return res;
  } else {
    return o;
  }
};

// Convert the BigNumber object in the ethers.js library to a hexadecimal string 
// format suitable for Ethereum JSON-RPC calls. 
// This format requires the string to start with "0x" and not contain any leading 
// zeros unless the value is zero, in which case the string should be "0x0"
export const toRpcHexString = (bn) => {
  // 1. BigNumber(100)
  let val = bn.toHexString();
  // 2. "0x3e8"

  // 3. "0x" + "3e8"
  val = "0x" + val.replace("0x", "").replace(/^0+/, "");

  if (val == "0x") {
    val = "0x0";
  }

  // 4. "0x3e8"
  return val;
};

export const calcNextBlockBaseFee = (curBlock) => {
  const baseFee = curBlock.baseFeePerGas;
  const gasUsed = curBlock.gasUsed;
  const targetGasUsed = curBlock.gasLimit.div(2);
  const delta = gasUsed.sub(targetGasUsed);

  const newBaseFee = baseFee.add(
    baseFee.mul(delta).div(targetGasUsed).div(ethers.BigNumber.from(8))
  );

  // Add 0-9 wei so it becomes a different hash each time
  const rand = Math.floor(Math.random() * 10);
  return newBaseFee.add(rand);
};
