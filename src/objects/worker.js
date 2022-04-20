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

const syncData = async(context, app) => {
  try {
    await context.iiko.getToken();
    await context.branches.update(context.iiko);
    context.targets.makeEmptyTargets(context.branches.getBranches());
    await context.categories.update(context.iiko);
    for (const branch of context.branches.getBranches()) {
      await context.purchases.updatePurchases(context.iiko, null, null, branch);
    }
    await context.iiko.close();
    context.links.update(context.targets.getAllTargets(), app);
    updateLinks(context, app);
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
    if (await syncData(context, app)) {
      timeRun = Date.now() + timeSpan;
      updateLinks(context, app);
    }
  }
}

module.exports = {
  runWorker,
  syncData
}