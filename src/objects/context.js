const { Iiko } = require("../objects/iiko");
const { Branches } = require("../objects/branches");
const { Categories } = require("../objects/categories");
const { Targets } = require("../objects/targets");
const { Purchases } = require("../objects/purchases");
const { Links } = require("../objects/links");
const { Cashiers } = require("./cashiers");

const initContext = async () => {
  let context = {};
  context.branches = new Branches();
  context.categories = new Categories();
  context.targets = new Targets();
  context.purchases = new Purchases();
  context.links = new Links();
  await formData(context);
  return context;
}

const formData = async (context) => {
  try {
    let iiko = new Iiko();
    await iiko.getToken();
    await context.branches.update(iiko);
    await context.categories.update(iiko);
    //await context.cashiers.update(iiko);
    context.targets.makeEmptyTargets(context.branches.getBranches());
    //context.purchases.updateTargets(context.targets.getAllTargets(), context.cashiers.getAllCashiers());
    context.links.generate(context.targets.getAllTargets());
    await iiko.close();
  } catch (e) {
    console.log(e);
  }
}

const getColumnNum = (targets, name) => {
  let i = 0;
  for (const target of targets) {
    if (target.dish === name) {
      return i;
    }
    i += 1;
  }
  return null;
}

const duplicateRow = (arr, n) => {
  let i = arr.length;
  arr.push(arr[i - 1]);
  while (i > n) {
    arr[i] = arr[i-1];
    i -= 1;
  }
}

const getPublicData = (context, dep) => {
  const emptyRow = [0, "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let data = {};
  data.header = [
    ["№", "ФИО кассира", "Чеки", "", "", "", "", "", "", "", "", "", "", "", "", "Итог продаж", "", "", ""],
    ["", "", "Факт", "Цель на 100 чеков", "Факт по категории", "Факт на 100 чеков", "Цель на 100 чеков", "Факт по категории", "Факт на 100 чеков",
      "Цель на 100 чеков", "Факт по категории", "Факт на 100 чеков", "Цель на 100 чеков", "Факт по категории", "Факт на 100 чеков",
      "Цель 1 (на 100 чеков)", "Цель 2 (на 100 чеков)", "Факт", "Оклонение от цели"]
  ];
  let y = 1;
  for (const target of context.targets.getAllTargets().filter(el => el.department === dep)) {
    data.header[0][y*3] = target.dish;
    y += 1;
  }
  data.body = [];
  for (const purchase of context.purchases.getPurchases()) {
    if (purchase.department === dep) {
      let flag = false;
      let i = 0;
      for (const row of data.body) {
        if (row[1] === purchase.cashier) {
          flag = true;
          break;
        }
        i += 1;
      }
      if (!flag) {
        data.body.push(emptyRow);
        data.body[i][0] = i + 1;
        data.body[i][1] = purchase.cashier;
      }
      for (const item of purchase.cart) {
        const target = context.targets.getAllTargets().find(el => el.department === dep
          && el.targets.dish === item.dish);
        if (target) {
          data.body[i][2] += item.count;
          let c = getColumnNum(context.targets.getAllTargets().find(el => el.department === dep), item.dish);
          data.body[i][4 + (c * 3)] += item.count;
          data.body[i][3 + (c * 3)] = target.target1;
          data.body[i][5 + (c * 3)] = target.target2;
        }
      }
    }
  }
  let i = 0;
  const n = data.body.length;
  while (i < n) {
    duplicateRow(data.body, i * 2);
    data.body[i * 2 + 1][0] = 0;
    data.body[i * 2 + 1][3] = data.body[i * 2][5];
    data.body[i * 2 + 1][6] = data.body[i * 2][8];
    data.body[i * 2 + 1][9] = data.body[i * 2][11];
    data.body[i * 2 + 1][12] = data.body[i * 2][14];
    data.body[i * 2][5] = Math.floor(data.body[i * 2][4] / data.body[i * 2][2]);
    data.body[i * 2 + 1][5] = data.body[i * 2][5];
    data.body[i * 2][8] = Math.floor(data.body[i * 2][7] / data.body[i * 2][2]);
    data.body[i * 2 + 1][8] = data.body[i * 2][8];
    data.body[i * 2][11] = Math.floor(data.body[i * 2][10] / data.body[i * 2][2]);
    data.body[i * 2 + 1][11] = data.body[i * 2][11];
    data.body[i * 2][14] = Math.floor(data.body[i * 2][13] / data.body[i * 2][2]);
    data.body[i * 2 + 1][14] = data.body[i * 2][14];
    data.body[i * 2][17] = data.body[i * 2][5] + data.body[i * 2][8] + data.body[i * 2][11] + data.body[i * 2][14];
    data.body[i * 2 + 1][17] = data.body[i * 2][17];
    data.body[i * 2][15] = data.body[i * 2][3] + data.body[i * 2][6] + data.body[i * 2][9] + data.body[i * 2][12];
    data.body[i * 2][16] = "";
    data.body[i * 2 + 1][16] = data.body[i * 2 + 1][3] + data.body[i * 2 + 1][6] + data.body[i * 2 + 1][9] + data.body[i * 2 + 1][12];
    data.body[i * 2 + 1][15] = "";
    data.body[i * 2][18] = data.body[i * 2][17] - data.body[i * 2][15];
    data.body[i * 2 + 1][18] = data.body[i * 2 + 1][17] - data.body[i * 2 + 1][16];
    i += 1;
  }
  return data;
}

const getProtectedData = (context) => {
  let data = [];
  for (const target of context.targets.getAllTargets()) {
    let row = [target.department, context.links.getLink(target.department)];
    for (const dish of target.targets) {
      row.push(dish.dish, dish.surname, dish.target1, dish.target2);
    }
    data.push(row);
  }
  return data;
}

module.exports = {
  initContext,
  getPublicData,
  getProtectedData
}