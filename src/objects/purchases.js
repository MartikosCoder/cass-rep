class Purchases {

  constructor() {
    this.purchases = [];
    const date = new Date();
    this.lastCheck = date.getFullYear() + '-';
    const month = date.getMonth() + 1;
    if (month < 10) {
      this.lastCheck += '0';
    }
    this.lastCheck += month + '-';
    if (date.getDate() < 10) {
      this.lastCheck += '0';
    }
    this.lastCheck += date.getDate() + 'T00:00:00.000';
  }

  clearPurchases() {
    this.purchases.forEach(item1 => {
      item1.forEach(item2 => {
        item2.count = 0;
      });
    });
    this.lastCheck = "";
  }

  updateTargets(targets) {
    for (const item1 of targets) {
      if (this.purchases.indexOf(el => el.department === item1.department) === -1) {
        this.purchases.push({ department: item1.department, cart: [] } );
      }
      let exist = this.purchases.find(el => el.department === item1.department);
      for (const item2 of item1.targets) {
        if (exist.cart.indexOf(el => el.dish === item2.dish) === -1) {
          exist.cart.push({ dish: item2.dish, count: 0 });
        } else {
          let item = exist.cart.find(el => el.dish === item2.dish);
          item.count = 0;
        }
      }
    }

    for (const purchase of this.purchases) {
      if (targets.indexOf(el => el.department === purchase.department) === -1) {
        const department = purchase.department;
        delete this.purchases[department];
      } else {
        for (const item of purchase.cart) {
          if (targets.indexOf(el => el.department === purchase.department && el.targets.dish === item.dish) === -1) {
            const dish = item.dish;
            delete item[dish];
          }
        }
      }
    }
  }

  async updatePurchases(iiko) {
    const results = await iiko.getRepo(this.lastCheck);
    const date = new Date();
    this.lastCheck = date.toJSON();
    for (const row of results.data) {
      let dep = this.purchases.find(el => el.department === row['Department'] && el.cashier === row['Cashier']);
      if (!dep) {
        this.purchases.push({ department: row['Department'], cashier: row['Cashier'], cart: {} });
        dep = this.purchases.find(el => el.department === row['Department'] && el.cashier === row['Cashier']);
      }
      let item = this.purchases.find(el => el.department === row['Department']
        && el.cashier === row['Cashier'] && el.cart.dish === row['DishCategory']);
      if (!item) {
        dep.cart.push({ dish: row['DishCategory'], count: 0 });
        item = this.purchases.find(el => el.department === row['Department']
          && el.cashier === row['Cashier'] && el.cart.dish === row['DishCategory']);
      }
      item.count += row['DishAmountInt'];
    }
  }

  getPurchases() {
    return this.purchases;
  }
}

module.exports = {
  Purchases
}