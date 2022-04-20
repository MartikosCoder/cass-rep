const removeRoute = require('express-remove-route');

class Links {

  constructor() {
    this.links = [];
    this.lastIndex = 0;
  }

  generate(targets) {
    this.links = [];
    for (const target of targets) {
      this.lastIndex += 1;
      this.links.push({ department: target.department, link: `/public/d${this.lastIndex}`});
    }
  }

  update(targets, app) {
    for (const link of this.links) {
      try{
      removeRoute(app, link.link);}
      catch (e) {
        console.log(e)
      }
    }
    this.links = [];
    this.lastIndex = 0;
    for (const target of targets) {
        this.lastIndex += 1;
        this.links.push({ department: target.department, link: `/public/d${this.lastIndex}`});
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