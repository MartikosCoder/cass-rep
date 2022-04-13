class Categories {

  constructor() {
    this.categories = [];
  }

  async update(iiko) {
    const result = await iiko.getCategories();

    if (result) {
      this.categories = [];
      result.forEach(item => {
        if (!item.deleted) {
          this.categories.push(item.name);
        }
      })
    }
  }

  getCategories() {
    return this.categories;
  }
}

module.exports = {
  Categories
}
