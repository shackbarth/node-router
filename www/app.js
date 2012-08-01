
enyo.kind({
  name: "App",
  classes: "administravia onyx",
  fit: true,
  kind: "Scroller",
  start: function () {
    this.renderInto(document.body);
  },
  components: [
    {name: "databases", kind: "Databases"},
    {name: "users", kind: "Users"},
    {name: "organizations", kind: "Organizations"}
  ]
});

enyo.kind({
  name: "Entity",
  classes: "entity onyx",
  create: function () {
    this.inherited(arguments);
    this.createComponent({
      name: "title",
      content: this.title,
      classes: "title"
    });
  }
});

enyo.kind({
  name: "AdministraviaList",
  classes: "administravia-list",
  kind: "List",
  handlers: {
    onSetupItem: "setupItem"
  },
  components: [
    {name: "item"}
  ]
});

enyo.kind({
  name: "Editor",
  classes: "editor"
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
  name: "DatabaseList",
  kind: "AdministraviaList",
  count: 100,
  setupItem: function (inSender, inEvent) {
    this.$.item.setContent("YOYO YO OY OYOYOYOYOYOYOYO");
  },
  create: function () {
    this.inherited(arguments);
    this.reset();
  }
});

enyo.kind({
  name: "UserList",
  kind: "AdministraviaList",
  count: 100,
  setupItem: function (inSender, inEvent) {
    this.$.item.setContent("YOYO YO OY OYOYOYOYOYOYOYO");
  },
  create: function () {
    this.inherited(arguments);
    this.reset();
  }
});

enyo.kind({
  name: "OrganizationList",
  kind: "AdministraviaList",
  count: 100,
  setupItem: function (inSender, inEvent) {
    this.$.item.setContent("YOYO YO OY OYOYOYOYOYOYOYO");
  },
  create: function () {
    this.inherited(arguments);
    this.reset();
  }
});

enyo.kind({
  name: "DatabaseEditor",
  kind: "Editor",
  components: [
    {name: "box", kind: "onyx.Groupbox", components: [
      {name: "header", kind: "onyx.GroupboxHeader", content: "Database Server"},
      {kind: "onyx.InputDecorator", components: [
        {name: "name", kind: "onyx.Input", placeholder: "Name"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "hostname", kind: "onyx.Input", placeholder: "Hostname"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "port", kind: "onyx.Input", placeholder: "Port"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "description", kind: "onyx.Input", placeholder: "Description"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "user", kind: "onyx.Input", placeholder: "User"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "password", kind: "onyx.Input", type: "password", placeholder: "Password"}]}]}
  ]
});

enyo.kind({
  name: "UserEditor",
  kind: "Editor",
  components: [
    {name: "box", kind: "onyx.Groupbox", components: [
      {name: "header", kind: "onyx.GroupboxHeader", content: "User"},
      {kind: "onyx.InputDecorator", components: [
        {name: "id", kind: "onyx.Input", placeholder: "ID (Email Address)"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "password", kind: "onyx.Input", type: "password", placeholder: "Password"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "organizations", kind: "onyx.Input", placeholder: "Organizations"}]}]}
  ]
});

enyo.kind({
  name: "OrganizationEditor",
  kind: "Editor",
  components: [
    {name: "box", kind: "onyx.Groupbox", components: [
      {name: "header", kind: "onyx.GroupboxHeader", content: "Organization"},
      {kind: "onyx.InputDecorator", components: [
        {name: "name", kind: "onyx.Input", placeholder: "Name"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "databaseServer", kind: "onyx.Input", placeholder: "Database Server"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "description", kind: "onyx.Input", placeholder: "Description"}]},
      {kind: "onyx.InputDecorator", components: [
        {name: "cloud", kind: "onyx.Input", placeholder: "Cloud Instance"}]}]}
  ]
});

enyo.kind({
  name: "Controls",
  classes: "controls",
  components: [
    {name: "box", kind: "onyx.Groupbox", components: [
      {name: "new", kind: "onyx.Button", content: "New"},
      {name: "save", kind: "onyx.Button", content: "Save", disabled: true}]}
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