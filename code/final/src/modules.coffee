Backbone.sync = (method, model, options) ->

	storageKey = if typeof model.url is "function" then model.url() else model.url

	if model.isNew()
		model.set({"id": parseInt(Math.random()*10000)},{silent: true})
		storageKey += "/#{model.id}"

	console.log storageKey, method, JSON.stringify(model), JSON.stringify(options)

	switch method
			when "create","update" then localStorage[storageKey] = JSON.stringify(model.toJSON())
			when "read"		then model.set(JSON.parse(localStorage[storageKey]))
			when "delete"	then delete localStorage[storageKey]



ns = {}
window.ns = ns

ns.model = {}
ns.templates = {}
ns.view = {}

ns.App = class App extends Backbone.Router

	routes: {
		"" : "_loadDefaultList"
		"tasks/:taskId" : "_showTask"
	}

	###* @type {Element} ###
	containerEl:null
	###* @type {Tasks} ###
	_tasks:null
	###* @type {TaskListView} ###
	_tasksListView: null
	###* @type {TasksForm} ###
	_tasksForm : null

	constructor: (@containerEl, silent)->
		super()
		# were ignoring exceptions here so that were able to create several apps and start the history
		try Backbone.history.start({silent: silent})
		
	getTasks : ()=> @_tasks
	getTaskListView: ()=> @_tasksListView
	getTasksForm: ()=> @_tasksForm

	_doSetup : ()=>

		@_tasks = new ns.model.Tasks()
		@_tasksForm = new ns.view.TasksForm(@containerEl, @_tasks)
		@_tasksListView = new ns.view.TaskListView(@containerEl, @_tasks)


	_loadDefaultList : ()=>
		@_doSetup()

	_showTask: (taskId)=>
		@_tasks = new ns.model.Tasks()
		@_tasks.add( new ns.model.Task({id: taskId}).fetch() )
		@_tasksListView = new ns.view.TaskListView(@containerEl, @_tasks)



ns.model.Task = class Task extends Backbone.Model

	url : ()=>
		if @isNew()
			"tasks"
		else
			"tasks/#{@id}"

	defaults: {
		name: null
	}

ns.model.Tasks = class Tasks extends Backbone.Collection
	url : ""
	model : ns.model.Task
	initialize : ()->
		@on("add", (m)-> m.save())


ns.view.TaskListView = class TaskListView extends Backbone.View

	tagName: "ul"

	###* @type {Element} ###
	containerEl : null

	###* @param {ns.model.Tasks} collection ###
	constructor : (@containerEl, collection)->
		super({collection: collection})
		@render()
		@collection.forEach( (m)=>@addTask(m) )
		@collection.bind("add", @addTask)
		

	render: ()=>
		@containerEl.append(@el)

	###* @param {ns.model.Task} taskModel ###
	addTask: (taskModel)=>
		newItem = new ns.view.TaskListItemView(@el, taskModel)
		@$el.append( newItem.el )

ns.view.TaskListItemView = class TaskListItemView extends Backbone.View

	tagName : "li"
	events : {
		"click a.delete" : "_deleteListItem"
	}


	###* @type {Element} ###
	containerEl : null
	###* @type {ns.model.Task} ###
	model : null

	constructor : (@containerEl, model)->
		super({model: model})
		@render()
		@model.on("destroy", @_removeThySelf)

	render: ()=> 
		@$el.html(ns.templates.litItem(@model.get("name"), @model.id))
		jQuery(@containerEl).append(@el)

	_removeThySelf : ()=>
		@$el.remove()

	_deleteListItem : (e)=>
		e.preventDefault()
		@model.destroy()

ns.view.TasksForm = class TasksForm extends Backbone.View

	tagName : "div"
	events : {
		"click button.add-task" : "_addTaskPressed"
	}

	###* @type {Element} ###
	containerEl : null
	constructor : (@containerEl, collection)->
		super({collection: collection})
		@render()

	render: ()=>
		@$el.append( ns.templates.tasksForm() )
		@containerEl.append(@el)

	_addTaskPressed : (e)=>
		e.preventDefault()
		@collection.add({name: @$("input.task-text").val()})



ns.templates.container = ()->
	"""
	<div style="width: 500px; height: 500px"></div>
	"""

ns.templates.title = ()->
	"""
	<h2>ToDos</h2>
	"""

ns.templates.tasksForm = ()->
	"""
	<fieldset>
		<legend>New ToDo</legend>
		<form onsubmit="return false;">
			<input type="text" class="task-text"/>
			<button class="add-task">Add ToDo Item</button>
		</form>
	</fieldset>
	"""

ns.templates.litItem = (itemText, id)->
	"""
	<li>#{id} :: <b>#{itemText}</b> <a href="#" class="delete" style="color: red">delete</li>
	"""

