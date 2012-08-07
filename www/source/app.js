
enyo.kind({
  name: "App",
  classes: "administravia onyx",
  fit: true,
  kind: "Scroller",
  components: [
    {name: "databases", kind: "Databases"},
    {name: "users", kind: "Users"},
    {name: "organizations", kind: "Organizations"}
  ]
});

enyo.kind({
  name: "Entity",
  classes: "entity onyx",
  handlers: {
    onPopulate: "populate",
    onNewTapped: "clear",
    onSaveTapped: "save",
    onDeleteTapped: "deleteEntry",
    onEnableSave: "enableSave",
    onDisableSave: "disableSave",
    onEnableDelete: "enableDelete",
    onDisableDelete: "disableDelete",
    onResetList: "resetList"
  },
  create: function () {
    this.inherited(arguments);
    this.createComponent({
      name: "title",
      content: this.title,
      classes: "title"
    });
  },
  populate: function (ignore, obj) {
    this.$.editor.populate(obj);
  },
  clear: function () {
    this.$.editor.clear();
  },
  save: function () {
    this.$.editor.save();
  },
  enableSave: function () {
    this.$.controls.enableSave();
  },
  disableSave: function () {
    this.$.controls.disableSave();
  },
  enableDelete: function () {
    this.$.controls.enableDelete();
  },
  disableDelete: function () {
    this.$.controls.disableDelete();
  },
  resetList: function () {
    this.$.list.lookup();
  },
  deleteEntry: function () {
    this.$.editor.deleteEntry();
  }
});

enyo.kind({
  name: "AdministraviaList",
  classes: "administravia-list",
  kind: "List",
  handlers: {
    onSetupItem: "setupItem"
  },
  published: {
    contentArray: null
  },
  rowTapped: function (row, evt) {
    var idx = evt.index, c = this.getContentArray();
    this.bubble("onPopulate", c[idx]);
  },
  contentArrayChanged: function () {
    var c = this.getContentArray();
    this.setCount(c.length);
    this.reset();
  },
  lookup: function () {
    var handler = this.lookupHandler, x = new enyo.Ajax({
      url: handler,
      method: "POST"
    });
    x.go();
    x.response(this, "didReceiveResponse");
  },
  create: function () {
    this.inherited(arguments);
    this.lookup();
  },
  didReceiveResponse: function (ignore, result) {
    this.setContentArray(result);
  }
});

enyo.kind({
  name: "Editor",
  classes: "editor",
  fieldChanged: function () {
    if (this.noContent()) this.bubble("onDisableSave");
    else this.bubble("onEnableSave");
  },
  populate: function (obj) {
    this.clear();
    for (var k in obj) {
      if (!obj.hasOwnProperty(k)) continue;
      if (this.$[k]) {
        this.$[k].setValue(obj[k]);
      }
    }
    this.bubble("onEnableSave");
    this.bubble("onEnableDelete");
  },
  clear: function () {
    for (var k in this.$) {
      if (!this.$.hasOwnProperty(k)) continue;
      if (this.$[k].kind === "onyx.Input") this.$[k].setValue("");
    }
  },
  noContent: function () {
    var c = this.getContent(), k;
    for (k in c) {
      if (!c.hasOwnProperty(k)) continue;
      if (c[k] && c[k] !== "") return false;
    }
    return true;
  },
  getContent: function () {
    var ret = {}, k;
    for (k in this.$) {
      if (!this.$.hasOwnProperty(k)) continue;
      if (this.$[k].kind === "onyx.Input") ret[k] = this.$[k].getValue();
    }
    return ret;
  },
  save: function () {
    var handler = this.saveHandler, content = this.getContent(), x;
    x = new enyo.Ajax({
      url: handler,
      method: "POST"
    });
    x.go(JSON.stringify(content));
    x.response(this, "didReceiveResponse");
  },
  deleteEntry: function () {
    var handler = this.deleteHandler, content = this.getContent(), x;
    x = new enyo.Ajax({
      url: handler,
      method: "POST"
    });
    x.go(JSON.stringify(content));
    x.response(this, "didReceiveResponse");
  },
  didReceiveResponse: function (ignore, result) {
    if (result && result.isError) {
      console.warn("ERROR: ", result.reason);
    } else {
      this.clear();
      this.bubble("onResetList");
    }
  }
});

enyo.kind({
  name: "Databases",
  classes: "databases",
  kind: "Entity",
  title: "Database Servers",
  components: [
    {name: "list", kind: "DatabaseList"},
    {name: "controls", kind: "DatabaseControls"},
    {name: "editor", kind: "DatabaseEditor"}
  ]
});

enyo.kind({
  name: "Users",
  classes: "users",
  kind: "Entity",
  title: "Users",
  components: [
    {name: "list", kind: "UserList"},
    {name: "controls", kind: "UserControls"},
    {name: "editor", kind: "UserEditor"}
  ]
});

enyo.kind({
  name: "Organizations",
  classes: "organizations",
  kind: "Entity",
  title: "Organizations",
  components: [
    {name: "list", kind: "OrganizationList"},
    {name: "controls", kind: "OrganizationControls"},
    {name: "editor", kind: "OrganizationEditor"}
  ]
});

enyo.kind({
  name: "DatabaseListItem",
  classes: "database-list-item",
  components: [
    {name: "name", classes: "name"},
    {name: "description", classes: "description"}
  ]
});

enyo.kind({
  name: "OrganizationListItem",
  classes: "database-list-item",
  components: [
    {name: "name", classes: "name"},
    {name: "description", classes: "description"}
  ]
});

enyo.kind({
  name: "UserListItem",
  classes: "user-list-item",
  components: [
    {name: "id", classes: "id"}
  ]
});

enyo.kind({
  name: "DatabaseList",
  kind: "AdministraviaList",
  setupItem: function (inSender, inEvent) {
    var idx = inEvent.index, c = this.getContentArray();
    this.$.item.$.name.setContent(c[idx].name);
    this.$.item.$.description.setContent(c[idx].description);
  },
  components: [
    {name: "item", kind: "DatabaseListItem", ontap: "rowTapped"}
  ],
  lookupHandler: "lookup/databases"
});

enyo.kind({
  name: "UserList",
  kind: "AdministraviaList",
  setupItem: function (inSender, inEvent) {
    var idx = inEvent.index, c = this.getContentArray();
    this.$.item.$.id.setContent(c[idx].id);
  },
  components: [
    {name: "item", kind: "UserListItem", ontap: "rowTapped"}
  ],
  lookupHandler: "lookup/users"
});


enyo.kind({
  name: "OrganizationList",
  kind: "AdministraviaList",
  setupItem: function (inSender, inEvent) {
    var idx = inEvent.index, c = this.getContentArray();
    this.$.item.$.name.setContent(c[idx].name);
    this.$.item.$.description.setContent(c[idx].description);
  },
  components: [
    {name: "item", kind: "OrganizationListItem", ontap: "rowTapped"}
  ],
  lookupHandler: "lookup/organizations"
});

enyo.kind({
  name: "DatabaseEditor",
  kind: "Editor",
  saveHandler: "/save/database",
  deleteHandler: "/delete/database",
  components: [
    {name: "box", kind: "onyx.Groupbox", components: [
      {name: "header", kind: "onyx.GroupboxHeader", content: "Database Server"},
      {kind: "onyx.InputDecorator", components: [
        {name: "name", kind: "onyx.Input", placeholder: "Name", oninput: "fieldChanged"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "hostname", kind: "onyx.Input", placeholder: "Hostname", oninput: "fieldChanged"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "port", kind: "onyx.Input", placeholder: "Port", oninput: "fieldChanged"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "description", kind: "onyx.Input", placeholder: "Description", oninput: "fieldChanged"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "user", kind: "onyx.Input", placeholder: "User", oninput: "fieldChanged"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "password", kind: "onyx.Input", type: "password", placeholder: "Password", oninput: "fieldChanged"}]}]}
  ]
});

enyo.kind({
  name: "UserEditor",
  kind: "Editor",
  saveHandler: "/save/user",
  deleteHandler: "/delete/user",
  components: [
    {name: "box", kind: "onyx.Groupbox", components: [
      {name: "header", kind: "onyx.GroupboxHeader", content: "User"},
      {kind: "onyx.InputDecorator", components: [
        {name: "id", kind: "onyx.Input", placeholder: "ID (Email Address)", oninput: "fieldChanged"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "password", kind: "onyx.Input", type: "password", placeholder: "Password", oninput: "fieldChanged"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "organizations", kind: "onyx.Input", placeholder: "Organizations", oninput: "fieldChanged"}]}]}
  ],
  populate: function (obj) {
    delete obj.password;
    this.clear();
    for (var k in obj) {
      if (!obj.hasOwnProperty(k)) continue;
      if (this.$[k]) {
        if (k === "organizations") {
          this.$[k].setValue(_.map(obj[k], function (entry) { return "%@:%@".f(entry.name, entry.username); }).join(", "));
        } else this.$[k].setValue(obj[k]);
      }
    }
    this.bubble("onEnableSave");
    this.bubble("onEnableDelete");
  }
});

enyo.kind({
  name: "OrganizationEditor",
  kind: "Editor",
  saveHandler: "/save/organization",
  deleteHandler: "/delete/organization",
  components: [
    {name: "box", kind: "onyx.Groupbox", components: [
      {name: "header", kind: "onyx.GroupboxHeader", content: "Organization"},
      {kind: "onyx.InputDecorator", components: [
        {name: "name", kind: "onyx.Input", placeholder: "Name", oninput: "fieldChanged"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "databaseServer", kind: "onyx.Input", placeholder: "Database Server", oninput: "fieldChanged"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "description", kind: "onyx.Input", placeholder: "Description", oninput: "fieldChanged"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "cloud", kind: "onyx.Input", placeholder: "Cloud Instance", oninput: "fieldChanged"}]}]}
  ]
});

enyo.kind({
  name: "Controls",
  classes: "controls",
  newTapped: function () {
    this.bubble("onNewTapped");
    this.enableSave();
    this.disableDelete();
  },
  saveTapped: function () {
    this.bubble("onSaveTapped");
    this.disableSave();
    this.disableDelete();
  },
  deleteTapped: function () {
    this.bubble("onDeleteTapped");
    this.disableSave();
    this.disableDelete();
  },
  enableSave: function () {
    this.$.save.setDisabled(false);
  },
  disableSave: function () {
    this.$.save.setDisabled(true);
  },
  disableDelete: function () {
    this.$.delete.setDisabled(true);
  },
  enableDelete: function () {
    this.$.delete.setDisabled(false);
  },
  components: [
    {name: "box", kind: "onyx.Groupbox", components: [
      {name: "new", kind: "onyx.Button", content: "New", ontap: "newTapped"},
      {name: "save", kind: "onyx.Button", content: "Save", disabled: true, ontap: "saveTapped"},
      {name: "delete", kind: "onyx.Button", content: "Delete", disabled: true, ontap: "deleteTapped"}]}
  ]
});

enyo.kind({
  name: "DatabaseControls",
  kind: "Controls"
});

enyo.kind({
  name: "OrganizationControls",
  kind: "Controls"
});

enyo.kind({
  name: "UserControls",
  kind: "Controls"
});