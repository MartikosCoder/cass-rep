const {getFilters} = require("../iiko/getFilters");

class Filters {
  constructor() {
    this.filters = {
      payTypes: [],
      discountTypes: [],
      orderTypes: []
    }
  }

  async getInstant(iiko) {
    const filterTemplates = await iiko.getFilters();
    let i = 0;
    filterTemplates.payTypes.forEach(el => {
      this.filters.payTypes.push({ type: el, checked: false, num: i });
      i++;
    });
    i = 0;
    filterTemplates.discountTypes.forEach(el => {
      this.filters.discountTypes.push({ type: el, checked: false, num: i });
      i++
    });
    i = 0;
    filterTemplates.orderTypes.forEach(el => {
      this.filters.orderTypes.push({ type: el, checked: false, num: i });
      i++
    });
  }

  getFilters() {
    return this.filters;
  }

  update(pay, discount, order) {
    this.filters.payTypes.forEach(el => el.checked = false);
    this.filters.discountTypes.forEach(el => el.checked = false);
    this.filters.orderTypes.forEach(el => el.checked = false);
    if (!pay) pay = [];
    if (!discount) discount = [];
    if (!order) order = [];
    if (!Array.isArray(pay)) pay = [pay];
    if (!Array.isArray(discount)) discount = [discount];
    if (!Array.isArray(order)) order = [order];
    pay.forEach(el => {
      const i = this.filters.payTypes.findIndex(item => item.num === el);
      this.filters.payTypes[i].checked = true;
    });
    discount.forEach(el => {
      const i = this.filters.discountTypes.findIndex(item => item.num === el);
      this.filters.discountTypes[i].checked = true;
    });
    order.forEach(el => {
      const i = this.filters.orderTypes.findIndex(item => item.num === el);
      this.filters.orderTypes[i].checked = true;
    });
  }

  formQueryFilter() {
    const filter = {
      payTypes: []
    };
    this.filters.payTypes.forEach(el => {
      if (el.checked) filter.payTypes.push(el.type);
    });
    if (!this.filters.discountTypes[0].checked) {
      filter.discountTypes = [];
      this.filters.discountTypes.forEach(el => {
        if (el.checked) filter.discountTypes.push(el.type);
      })
    }
    if (!this.filters.orderTypes[0].checked) {
      filter.orderTypes = [];
      this.filters.orderTypes.forEach(el => {
        if (el.checked) filter.orderTypes.push(el.type);
      })
    }
    return filter;
  }
}

module.exports = {
  Filters
}