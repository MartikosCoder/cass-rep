const { timeSpan } = require('../consts/cron');
const { Iiko } = require("../objects/iiko");
const { formPublicData } = require("./context");

const updateLinks = (context, app) => {
  for (const link of context.links.getLinks()) {
    app.get(link.link, (req, res) => {
      const data = formPublicData(context, link.department);
      res.render('publicTable', { data });
    });
  }
}

const syncData = async(context) => {
  try {
    await context.iiko.getToken();
    await context.branches.update(context.iiko);
    context.targets.makeEmptyTargets(context.branches.getBranches());
    await context.categories.update(context.iiko);
    await context.purchases.updatePurchases(context.iiko);
    context.links.update(context.targets.getAllTargets());
    await context.iiko.close();
    return true;
  } catch (e) {
    if (context.iiko.token) {
      await context.iiko.close();
    }
    return false;
  }
}

const runWorker = async (context, app) => {
  let timeRun = 0;
  while (timeRun < Date.now()) {
    if (await syncData(context)) {
      timeRun = Date.now() + timeSpan;
      updateLinks(context, app);
    }
  }
}

module.exports = {
  runWorker,
  syncData
}