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

  makeEmptyTargets(departments, template = null) {
    this.allTargets = [];
    const emptyDish = {
      dish: "",
      surname: "",
      target1: 0,
      target2: 0
    }
    let newTarget = [];
    if (template) {
      newTarget = [...template];
    } else {
      for (let i = 0; i < 5; i++ ) newTarget.push(emptyDish);
    }
    for (const department of departments) {
      this.allTargets.push({ department, targets: newTarget });
    }
  }

  setDishTarget(department, n, dish, target1, target2, surname) {
    const newtarget = {
      dish,
      surname,
      target1,
      target2
    }
    for (const j in this.allTargets) {
      if (this.allTargets[j].department === department) {
        const t = this.allTargets[j].targets;
        const ts = [];
        for (let i = 0; i < 5; i++) {
          if (i === n) {
            ts.push(newtarget);
          } else {
            ts.push(t[i]);
          }
        }
        this.allTargets[j].targets = ts;
        break;
      }
    }
  }

  getAllTargets() {
    return this.allTargets;
  }

  getDepartmentTargets(department) {
    const item = this.allTargets.find(el => el.department === department);
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