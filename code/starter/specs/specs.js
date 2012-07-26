describe("Backbone.sync specs", function(){

});


describe("TO-DO app ", function(){

	
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
