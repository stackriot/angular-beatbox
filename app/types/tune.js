import app from "../app";

app.factory("bbTune", function(ng, $, bbUtils, bbPattern) {
	function bbTune(data) {
		this.patterns = { };
		this.categories = data && data.categories;
		this.displayName = data && data.displayName;
		this.sheet = data && data.sheet;
		this.description = data && data.description;
		this.speed = data && data.speed;

		if(data)
			this.extend(data);
	}

	bbTune.prototype = {
		extend : function(data, selectPattern) {
			if(data.patterns) {
				for(var patternName in data.patterns) {
					if(selectPattern && !selectPattern(patternName))
						continue;

					this.patterns[patternName] = new bbPattern(data.patterns[patternName]);
				}
			}
		},
		getLength : function() {
			return Object.keys(this.patterns).length;
		},
		createPattern : function(patternName, data) {
			return this.patterns[patternName] = new bbPattern(data);
		},
		renamePattern : function(patternName, newPatternName) {
			this.patterns[newPatternName] = this.patterns[patternName];
			delete this.patterns[patternName];
		},
		removePattern : function(patternName) {
			delete this.patterns[patternName];
		},
		isInCategory : function(category) {
			if(category == "all")
				return true;
			else if(!this.categories)
				return category == "custom";
			else
				return this.categories.indexOf(category) != -1;
		}
	};

	return bbTune;
});