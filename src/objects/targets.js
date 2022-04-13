class Targets {

  constructor() {
    this.allTargets = [];
  }

  setAllTargets(targets) {
    this.allTargets = targets;
  }

  setDepartmentTargets(department, targets) {
    if (!this.allTargets.includes({ department: department })) {
      this.allTargets.push({ department: department, targets: targets });
    } else {
      let item = this.allTargets.find({ department: department });
      item.targets = targets;
    }
  }

  makeEmptyTargets(departments) {
    this.allTargets = [];
    const emptyDish = {
      dish: "",
      surname: "",
      target1: 0,
      target2: 0
    }
    for (const department of departments) {
      this.allTargets.push({ department, targets: [emptyDish, emptyDish, emptyDish, emptyDish] });
    };
  }

  setDepartmentDishTarget(department, n, dish, target1, target2, surname) {
    let item = this.allTargets.find(el => el.department === department);
    item.targets[n].dish = dish;
    item.targets[n].surname = surname;
    item.targets[n].target1 = target1;
    item.targets[n].target2 = target2;
  }

  getAllTargets() {
    return this.allTargets;
  }

  getDepartmentTargets(department) {
    const item = this.allTargets.find({ department: department });
    if (!item) return null;
    return item.targets;
  }

  getDepartmentDishTarget = (department, dish) => {
    let item1 = this.allTargets.find({ department: department });
    if (!item1) return null;
    let item2 = item1.find({ dish: dish });
    if (!item2) return null;
    return item2.target;
  }
}

module.exports = {
  Targets
}