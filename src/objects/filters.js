const {getFilters} = require("../iiko/getFilters");

class Filters {
  constructor() {
    this.filters = {
      payTypes: [
        { type: "не указано", checked: false, num: 0 },
        { type: "(без оплаты)", checked: false, num: 1 },
      ],
      discountTypes: [{ type: "не указано", checked: false, num: 0 }],
      orderTypes: [{ type: "не указано", checked: false, num: 0 }]
    }
  }

  async getInstant(iiko) {
    const filterTemplates = await iiko.getFilters();
    this.filters = {
      payTypes: [
        { type: "не указано", checked: false, num: 0 },
        { type: "(без оплаты)", checked: false, num: 1 },
      ],
      discountTypes: [{ type: "не указано", checked: false, num: 0 }],
      orderTypes: [{ type: "не указано", checked: false, num: 0 }]
    }
    let i = 2;
    filterTemplates.payTypes.forEach(el => {
      this.filters.payTypes.push({ type: el, checked: false, num: i });
      i++;
    });
    i = 1;
    filterTemplates.discountTypes.forEach(el => {
      this.filters.discountTypes.push({ type: el, checked: false, num: i });
      i++
    });
    i = 1;
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
    // console.log(`pay: ${pay}`);
    // console.log(`disc: ${discount}`);
    // console.log(`order: ${order}`);
    if (!pay) pay = [];
    if (!discount) discount = [];
    if (!order) order = [];
    if (!Array.isArray(pay)) pay = [pay];
    if (!Array.isArray(discount)) discount = [discount];
    if (!Array.isArray(order)) order = [order];
    // console.log(`pay: ${pay}`);
    // console.log(`disc: ${discount}`);
    // console.log(`order: ${order}`);
    pay.forEach(el => {
      const i = +el;
      this.filters.payTypes[i].checked = true;
    });
    discount.forEach(el => {
      const i = +el;
      this.filters.discountTypes[i].checked = true;
    });
    order.forEach(el => {
      const i = +el;
      this.filters.orderTypes[i].checked = true;
    });
  }

  formQueryFilter() {
    const filter = {
      payTypes: [],
      discountTypes: [],
      orderTypes: []
    };
    this.filters.payTypes.forEach(el => {
      if (el.checked)
        if (el.type === "null") filter.payTypes.push(null);
        else filter.payTypes.push(el.type);
    });
    this.filters.discountTypes.forEach(el => {
      if (el.checked)
        if (el.type === "не указано") filter.discountTypes.push("");
        else filter.discountTypes.push(el.type);
    });
    this.filters.orderTypes.forEach(el => {
      if (el.checked)
        if (el.type === "не указано") filter.orderTypes.push("");
        else filter.orderTypes.push(el.type);
    });
    return filter;
  }
}

module.exports = {
  Filters
}