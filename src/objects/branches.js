class Branches {

  constructor() {
    this.branches = [];
  }

  async update(iiko) {
    const result = await iiko.getBranches();
    this.branches = [];

    if (result) {
      for (const branch of result['corporateItemDtoes']['corporateItemDto']) {
        this.branches.push(branch['name']);
      }
    }
  }

  getBranches() {
    return this.branches;
  }
}

module.exports = {
  Branches
}