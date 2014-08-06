var ThemeListViewModel = function() {
	var self = this;
	
	self.themes = ko.observableArray();
	self.chosenTheme = ko.observable();
	
	self.loadThemes = function() {
		//ajax request
		//$.ajax('/themes')
		self.themes.push(new ThemeViewModel(1, 'test'));
		self.themes.push(new ThemeViewModel(2, 'another one'));
	};
	
}

var ThemeViewModel = function(id, title, description, smallImage, largeImage){
	var self = this;
	self.themeId = ko.observable(id);
	self.title = ko.observable(title);
	self.description = ko.observable(description);
	self.words = ko.observableArray(['test','test']);
	self.smallImage = ko.observable(smallImage);
	self.largeImage = ko.observable(largeImage);
	self.addWord = function(){
		self.words.push('');
	}
}





