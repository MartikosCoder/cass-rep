const { timeSpan } = require('../consts/cron');
const { Iiko } = require("../objects/iiko");
const {getPublicData} = require("./context");

const updateLinks = (context, app) => {
  for (const link of context.links.getLinks()) {
    app.get(link.link, (req, res) => {
      res.render('publicTable', {data: getPublicData(context, link.department), dep: link.department});
    });
  }
}

const runWorker = async (context, app) => {
  let timeRun = 0;
  while (timeRun < Date.now()) {
    const iiko = new Iiko;
    await iiko.getToken();

    await context.branches.update(iiko);
    await context.categories.update(iiko);
    // this.context.targets.makeEmptyTargets(this.context.branches.getBranches());  //TODO удаление целей, для удаленных категорий
    context.purchases.updateTargets(context.targets.getAllTargets());
    await context.purchases.updatePurchases(iiko);
    context.links.update(context.targets.getAllTargets());
    await iiko.close();
    timeRun = Date.now() + timeSpan;
    updateLinks(context, app);
  }
}

module.exports = {
  runWorker
}