describe("Backbone.sync specs", function(){

	beforeEach(function(){
		localStorage.clear();
	})

	var baseModelUrl = "model";
	var modelBaseObject = {
		url: function(){ return this.id ? baseModelUrl+"/"+this.id : baseModelUrl }, 
		defaults: {testKey: "testVal"}
	};

	var getModel = function(){
		return new (Backbone.Model.extend(modelBaseObject))();
	};

	it("needs to save its state to local storage", function(){
		var m = getModel();
		m.save();
		expect(localStorage[m.url()]).toEqual(JSON.stringify(m.toJSON()));
	});

	it("needs to set the model's ID attribute on create", function(){
		var m = getModel();
		m.save();
		expect(m.id).toBeDefined();
	});

	it("needs to be able to update local storage", function(){
		var m = getModel();
		m.save();
		var newVal = "newVal";
		m.set({testKey:newVal })
		m.save();
		expect(JSON.parse(localStorage[m.url()]).testKey).toEqual(newVal);
	});

	it("needs to be able to read a model from local storage", function(){
		var m = getModel();
		var hmmVar = "hmmmm";
		m.set({testKey: hmmVar});
		m.save();
		m2 = getModel();
		m2.id = m.id;
		expect(JSON.stringify(m2.toJSON())).not.toEqual(JSON.stringify(m.toJSON()));
		m2.fetch();
		expect(JSON.stringify(m2.toJSON())).toEqual(JSON.stringify(m.toJSON()));
	});

	it ("needs to be able to delete the model from local storage", function(){
		var m = getModel();
		m.save();
		var key = m.url();
		m.destroy();
		expect(localStorage[key]).toBeUndefined();
	});


});


describe("TO-DO app ", function(){

	var createAppInstance = function(){
		window.location.href = "#"
		localStorage.clear();
		try { Backbone.history.stop() } catch (e){}// ignored..
		var container = jQuery(ns.templates.container());
		var myapp = new ns.App(container, false);
		myapp.navigate("/");
		return myapp;
	}

	var createCustomRouteAppInstance = function(){
		try { Backbone.history.stop() } catch (e){}// ignored..
		var container = jQuery(ns.templates.container());
		return new ns.App(container, true);
	}

	it("needs to be able to add a task", function(){
		var app1 = createAppInstance();
		app1.getTasks().add({name: "this is my first task"});
		expect(app1.getTasks().length).toEqual(1);
	});

	it("needs to be able to update the view with the new task", function(){
		var app2 = createAppInstance();
		expect(app2.getTaskListView().$el.children().length).toEqual(0);
		app2.getTasks().add({name: "this is my first task"});
		expect(app2.getTaskListView().$el.children().length).toEqual(1);
	})

	it("needs to be able to delete a task", function(){
		var app3 = createAppInstance();
		app3.getTasks().add({name: "this is my first task"});
		expect(app3.getTaskListView().$el.children().length).toEqual(1);
		app3.getTasks().models[0].destroy();
		expect(app3.getTaskListView().$el.children().length).toEqual(0);
	})

	it("needs to have a delete button to be able to delete a list item", function(){
		var app4 = createAppInstance();
		app4.getTasks().add({name:"need to be able to delete this task"});
		expect(app4.getTaskListView().$el.children().length).toEqual(1);
		expect(jQuery(app4.getTaskListView().$el.children().first()).find("a.delete").length).toEqual(1);
	})

	it("needs to be able to delete a task from the task itself", function(){
		var app5 = createAppInstance();
		app5.getTasks().add({name:"need to be able to delete this task"});
		expect(app5.getTaskListView().$el.children().length).toEqual(1);
		jQuery(app5.getTaskListView().$el.children().first()).find("a.delete").click();
		expect(app5.getTaskListView().$el.children().length).toEqual(0);
	})

	it("needs to be able to create a task using the UI", function(){
		var app6 = createAppInstance();
		expect(app6.getTaskListView().$el.children().length).toEqual(0);
		app6.getTasksForm().$("input.tast-text").val("this is my first task!");
		app6.getTasksForm().$("button.add-task").click();
		expect(app6.getTaskListView().$el.children().length).toEqual(1);
	})

	it("needs to be able to open a specific task when the app load (for example in another tab)", function(){
		var app7 = createAppInstance();
		app7.getTasks().add({name:"I'm the spirit of christmas past!"});
		app7.getTasks().add({name:"You should see only me!"});
		app7.getTasks().add({name:"Don't tell ghost busters you've seen me!"});
		app7.getTasks().add({name:"Do you see my cloths?"});
		// now let's create the new fake app to show one of tasks we added
		var taskId = app7.getTasks().models.filter( function(m){ return m.get("name") == "You should see only me!" } )[0].id
		var app8 = createCustomRouteAppInstance();
		app8.navigate("tasks/" + taskId, {trigger: true});
		expect(app8.getTaskListView().$el.children().length).toEqual(1);
		expect(app8.getTaskListView().$el.children().first().find("b").text()).toEqual("You should see only me!");
	})
});



// jasmine bootstrapping code (taken from http://pivotal.github.com/jasmine/)

var jasmineEnv = jasmine.getEnv();
jasmineEnv.updateInterval = 1000;

var htmlReporter = new jasmine.HtmlReporter();

jasmineEnv.addReporter(htmlReporter);

jasmineEnv.specFilter = function(spec) {
	return htmlReporter.specFilter(spec);
};

var currentWindowOnload = window.onload;

window.onload = function() {
	// were wrapping the loading function in "setTimeout" 
	// so that the coffeescript browser compiler gets a chance to compile our included
	// coffeescript source code
	setTimeout(function(){
		if (currentWindowOnload) {
			currentWindowOnload();
		}
		execJasmine();
	},0)
	
};

function execJasmine() {
	jasmineEnv.execute();
}