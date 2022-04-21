const { timeSpan } = require('../consts/cron');
const { Iiko } = require("../objects/iiko");
const { formPublicData } = require("./context");

const updateLinks = (context, app) => {
  let flag  = true;
  for (const target of context.targets.getAllTargets()) {
    const item = context.links.getLinks().find(el => el.department === target.department);
    if (!item) {
      flag = false;
      break;
    }
  }
  if (context.targets.getAllTargets().length != context.links.getLinks().length) {
    flag = false;
  }
  if (!flag) {
    context.links.update(context.targets.getAllTargets(), app);
    for (const link of context.links.getLinks()) {
      app.get(link.link, (req, res) => {
        const data = formPublicData(context, link.department);
        res.render('publicTable', {data});
      });
    }
  }
}

const syncData = async(context, app) => {
  try {
    context.connected = false;
    context.inProcess = true;
    await context.iiko.getToken();
    await context.branches.update(context.iiko);
    context.targets.makeEmptyTargets(context.branches.getBranches());
    await context.categories.update(context.iiko);
    for (const branch of context.branches.getBranches()) {
      await context.purchases.updatePurchases(context.iiko, null, null, branch);
    }
    await context.iiko.close();
    context.connected = true;
    context.inProcess = false;
    return true;
  } catch (e) {
    if (context.iiko.token) {
      await context.iiko.close();
    }
    context.inProcess = false;
    return false;
  }
}

const runWorker = async (context, app) => {
  let timeRun = 0;
  while (timeRun < Date.now()) {
    if (await syncData(context, app)) {
      timeRun = Date.now() + timeSpan;
      updateLinks(context, app);
    }
  }
}

module.exports = {
  runWorker,
  syncData,
  updateLinks
}