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
  context.iiko = new Iiko();
  context.inProcess = true;
  await formData(context);
  context.connected = true;
  context.inProcess = false;
  return context;
}

const formData = async (context) => {
  try {
    context.connected = false;
    context.inProcess = true;
    await context.iiko.getToken();
    await context.branches.update(context.iiko);
    await context.categories.update(context.iiko);
    context.targets.makeEmptyTargets(context.branches.getBranches());
    await context.iiko.close();
    context.connected = true;
    context.inProcess = false;
  } catch (e) {
    console.log(e);
  }
}

const getColumnNum = (targets, name) => {
  let i = 0;
  for (const target of targets.targets) {
    if (target.dish === name) {
      return i;
    }
    i += 1;
  }
  return null;
}

const formPublicData = (context, dep) => {
  const emptyRow = [0, "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true, 'border: 1px solid grey;text-align:center;color: blue;font-weight: bold;'];
  let data = {
    header: {
      up: ["№", "ФИО кассира", "Чеки", "", "", "", "", "Итог продаж"],
      down: ["Факт", "Цель на 100 чеков", "Факт по категории", "Факт на 100 чеков",
        "Цель 1 (на 100 чеков)", "Цель 2 (на 100 чеков)", "Факт", "Оклонение от цели"]
    },
    dep: dep,
    body: [],
    addon: ""
  }
  let y = 3;
  let body = [];
  const targets = context.targets.getAllTargets().find(el => el.department === dep)
  if (!targets) {
    return data
  }
  for (const target of targets['targets']) {
    data.header.up[y] = target.surname;
    y += 1;
  }
  const filtered = context.purchases.getPurchases().find(el => el.department === dep);
  if (filtered) {
    for (const person of filtered.persons) {
      for (const trade of person.cart) {
        let flag = false;
        let i = 0;
        for (const row of body) {
          if (row[1] === person.cashier) {
            flag = true;
            break;
          }
          i += 1;
        }
        if (!flag) {
          body.push([...emptyRow]);
          body[i][0] = i + 1;
          body[i][1] = person.cashier;
          const items = context.targets.getAllTargets().find(el => el.department === dep);
          if (items) {
            for (const item of items.targets) {
              let c = getColumnNum(items, item.dish);
              body[i][4 + (c * 3)] = 0;
              body[i][3 + (c * 3)] = item.target1;
              body[i][5 + (c * 3)] = item.target2;
            }
          }
        }
        body[i][2] = person.bills.length;
        const target = targets.targets.find(el => el.dish === trade.dish);
        if (target) {
          let c = getColumnNum(context.targets.getAllTargets().find(el => el.department === dep), trade.dish);
          body[i][4 + (c * 3)] += trade.count;
        }
      }
    }
  }
  for (const i in body) {
    let row1 = [...body[i]];
    let row2 = [...emptyRow];
    row2[3] = body[i][5];

    row1[5] = Math.floor(row1[4] * 100 / row1[2]);
    row2[6] = body[i][8];
    row1[8] = Math.floor(row1[7] * 100/ row1[2]);
    row2[9] = body[i][11];
    row1[11] = Math.floor(row1[10] * 100/ row1[2]);
    row2[12] = body[i][14];
    row1[14] = Math.floor(row1[13] * 100 / row1[2]);
    row1[17] = row1[5] + row1[8] + row1[11] + row1[14];
    row1[15] = row1[3] + row1[6] + row1[9] + row1[12];
    row2[16] = row2[3] + row2[6] + row2[9] + row2[12];
    row1[18] = row1[17] - row1[15];
    if (row1[18] < 0) {
      row1[20] = 'border: 1px solid grey;text-align:center;color: darkred;font-weight: bold;background-color: hotpink;';
    }
    row2[18] = row1[17] - row2[16];
    if (row2[18] < 0) {
      row2[20] = 'border: 1px solid grey;text-align:center;color: darkred;font-weight: bold;background-color: hotpink;';
    }
    row2[19] = false;
    data.body.push([...row1]);
    data.body.push([...row2]);
  }
  return data;
}

const getPublicData = async (context, dep, startDate = null, endDate = null) => {
  let tempContext = {
    branches: context.branches,
    categories: context.categories,
    targets: context.targets,
    links: context.links,
    iiko: context.iiko
  }
  if (!startDate && !endDate) {
    tempContext.purchases = context.purchases;
  } else {
    if (!startDate) {
      let date = new Date(endDate);
      date.setDate(date.getDate() - 1);
      startDate = date.toJSON().substring(0, 10);
    }
    if (!endDate) {
      let date = new Date(startDate);
      date.setDate(date.getDate() + 1);
      endDate = date.toJSON().substring(0, 10);
    } else {
      let date = new Date(endDate);
      date.setDate(date.getDate() + 1);
      endDate = date.toJSON().substring(0, 10);
    }
    await tempContext.iiko.getToken();
    tempContext.purchases = new Purchases();
    await tempContext.purchases.updatePurchases(tempContext.iiko, `${startDate}T00:00:00.000`, `${endDate}T00:00:00.000`, dep);
    await tempContext.iiko.close();
  }
  const data = formPublicData(tempContext, dep);
  if (startDate || endDate) {
    data.addon = 'Отчет за период: ' + startDate + ' - ' + endDate;
  }
  return data;
}

const getProtectedData = (context) => {
  let data = [];
  for (const target of context.targets.getAllTargets()) {

    let row = {
      department: target.department,
      link: context.links.getLink(target.department)
    };
    let i = 1;
    for (const dish of target.targets) {
      const cats = [];
      for (const cat of context.categories.getCategories()) {
        if (cat === dish.dish) {
          cats.push({name: cat, checked: true});
        } else {
          cats.push({name: cat, checked: false});
        }
      }
      row['categories_' + i] = cats;
      row['dish_' + i] = dish.dish;
      row['surname_' + i] = dish.surname;
      row['target1_' + i] = dish.target1;
      row['target2_' + i] = dish.target2;
      i += 1;
    }
    data.push(row);
  }
  return data;
}

module.exports = {
  initContext,
  getPublicData,
  getProtectedData,
  formPublicData
}