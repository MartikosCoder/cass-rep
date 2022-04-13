class Cashiers {
  constructor() {
    this.cashiers = [];
  }

  async update(iiko) {
    const result = await iiko.getCategories();

    if (result) {
      for (const item of result['employees']['employee']) {
        this.cashiers.push({ name: item['name'], id: item['id'] });
      }
    }
  }

  getAllCashiers() {
    return this.cashiers;
  }
}

module.exports = {
  Cashiers
}