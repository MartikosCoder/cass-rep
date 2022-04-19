class Purchases {

  constructor() {
    this.purchases = [];
    const date = new Date();
    this.lastCheck = date.toJSON().substring(0, 10) + 'T00:00:00.000';
  }

  clearPurchases() {
    this.purchases = [];
    const date = new Date();
    this.lastCheck = date.toJSON().substring(0, 10) + 'T00:00:00.000';
  }

  async updatePurchases(iiko, startDate = null, endDate = null) {
    if (!startDate) {
      startDate = this.lastCheck;
    }
    if (!endDate) {
      let date = new Date();
      date.setDate(date.getDate() + 1);
      endDate = date.toJSON().substring(0, 10) + 'T00:00:00.000';
    }
    const results = await iiko.getRepo(startDate, endDate);
    let date = new Date();
    this.lastCheck = date.toJSON().substring(0, 10) + 'T00:00:00.000';
    for (const row of results.data) {
      let dep = null;
      for (const i in this.purchases) {
        if (this.purchases[i].department === row['Department']) {
          dep = i;
          break;
        }
      }
      if (dep == null) {
        this.purchases.push({ department: row['Department'], persons: []});
        dep = this.purchases.length - 1;
      }
      let cash = null;
      for (const i in this.purchases[dep].persons) {
        if (this.purchases[dep].persons[i].cashier === row['Cashier']) {
          cash = i;
          break;
        }
      }
      if (cash == null) {
        this.purchases[dep].persons.push({ cashier: row['Cashier'], cart: [], bills: [] });
        cash = this.purchases[dep].persons.length - 1;
      }
      let dish = null;
      for (const i in this.purchases[dep].persons[cash].cart) {
        if (this.purchases[dep].persons[cash].cart[i].dish === row['DishCategory']) {
          dish = i;
          break;
        }
      }
      if (dish == null) {
        this.purchases[dep].persons[cash].cart.push({ dish: row['DishCategory'], count: 0 });
        dish = this.purchases[dep].persons[cash].cart.length - 1;
      }
      this.purchases[dep].persons[cash].cart[dish].count += row['DishAmountInt'];
      const bill = this.purchases[dep].persons[cash].bills.find(el => el === row['OrderNum']);
      if (!bill) {
        this.purchases[dep].persons[cash].bills.push(row['OrderNum']);
      }
    }
  }

  getPurchases() {
    return this.purchases;
  }
}

module.exports = {
  Purchases
}