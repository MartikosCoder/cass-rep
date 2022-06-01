const { filterTemplates } = require("../consts/filters");

class Filters {
  constructor() {
    this.filters = {
      payTypes: [],
      discountTypes: [],
      orderTypes: []
    }
    filterTemplates.payTypes.forEach(el => this.filters.payTypes.push({ type: el, checked: false }));
    filterTemplates.discountTypes.forEach(el => this.filters.discountTypes.push({ type: el, checked: false }));
    filterTemplates.orderTypes.forEach(el => this.filters.orderTypes.push({ type: el, checked: false }));
    this.filters.payTypes[0].checked = true;
    this.filters.discountTypes[0].checked = true;
    this.filters.orderTypes[0].checked = true;
  }

  getFilters() {
    return this.filters;
  }

  update(pay, discount, order) {
    this.filters.payTypes.forEach(el => el.checked = false);
    this.filters.discountTypes.forEach(el => el.checked = false);
    this.filters.orderTypes.forEach(el => el.checked = false);
    pay.forEach(el => {
      const i = this.filters.payTypes.findIndex(item => item.type === el);
      this.filters.payTypes[i].checked = true;
    });
    if (discount.contains("")) {
      this.filters.discountTypes[0].checked = true;
    } else {
      discount.forEach(el => {
        const i = this.filters.discountTypes.findIndex(item => item.type === el);
        this.filters.discountTypes[i].checked = true;
      });
    }
    if (order.contains("")) {
      this.filters.orderTypes[0].checked = true;
    } else {
      discount.forEach(el => {
        const i = this.filters.orderTypes.findIndex(item => item.type === el);
        this.filters.orderTypes[i].checked = true;
      });
    }
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