class Links {

  constructor() {
    this.links = [];
    this.lastIndex = 0;
  }

  generate(targets) {
    this.links = [];
    this.lastIndex = 0;
    for (const target of targets) {
      this.lastIndex += 1;
      this.links.push({ department: target.department, link: `/public/d${this.lastIndex}`});
    }
  }

  update(targets) {
    let i = 0;
    for (const link of this.links) {
      if (targets.indexOf(el => el.department === link.department) === -1) {
        this.links.splice(i, 1);
         i -= 1;
      }
      i += 1;
    }
    for (const target of targets) {
      if (this.links.indexOf(el => el.department === target.department) === -1) {
        this.lastIndex += 1;
        this.links.push({ department: target.department, link: `/public/d${this.lastIndex}`});
      }
    }
  }

  getLinks() {
    return this.links;
  }

  getLink(department) {
    const item = this.links.find(el => el.department === department);
    return item.link;
  }
}

module.exports = {
  Links
}