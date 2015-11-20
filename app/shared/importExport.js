angular.module("beatbox").factory("bbImportExport", function(bbConfig, ng, $, bbUtils, bbPatternEncoder, bbSongEncoder) {
	var bbImportExport = {
		_shouldExportPattern : function(songs, selectedPatterns, tuneName, patternName) {
			if(songs) {
				for(var songIdx=0; songIdx<songs.length; songIdx++) {
					if(songs[songIdx] && bbUtils.songContainsPattern(songs[songIdx], tuneName, patternName))
						return 2;
				}
			}

			return selectedPatterns && selectedPatterns[tuneName] && selectedPatterns[tuneName][patternName] ? 1 : 0;
		},

		exportObject : function(songs, tunes, selectedPatterns) {
			var ret = { patterns: { } };
			if(songs)
				ret.songs = bbSongEncoder.encodeSongs(songs);

			for(var tuneName in tunes) {
				var encodedPatterns = { };
				for(var patternName in tunes[tuneName].patterns) {
					if(!this._shouldExportPattern(songs, selectedPatterns, tuneName, patternName))
						continue;

					var originalPattern = bbConfig.tunes[tuneName] && bbConfig.tunes[tuneName].patterns[patternName];
					encodedPatterns[patternName] = bbPatternEncoder.getEncodedPatternObject(tunes[tuneName].patterns[patternName], originalPattern);
				}
				if(Object.keys(encodedPatterns).length > 0)
					ret.patterns[tuneName] = encodedPatterns;
			}

			if(Object.keys(ret.patterns).length == 0)
				delete ret.patterns;

			return ret;
		},

		exportString : function(songs, tunes, selectedPatterns) {
			var compressed = JSZip.compressions.DEFLATE.compress(JSON.stringify(this.exportObject(songs, tunes, selectedPatterns)), { level: 9, to: "string" });
			compressed.charCodeAt = function(i) { return this[i]; };
			return JSZip.base64.encode(compressed).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '.');
		},

		importObject : function(object) {
			var ret = { songs: [ ], tunes: { }, errors: [ ] };
			var errors = [ ];
			if(object.patterns) {
				for(var tuneName in object.patterns) {
					ret.tunes[tuneName] = { };
					for(var patternName in object.patterns[tuneName]) {
						try {
							ret.tunes[tuneName][patternName] = bbPatternEncoder.applyEncodedPatternObject(object.patterns[tuneName][patternName], bbConfig.tunes[tuneName] && bbConfig.tunes[tuneName][patternName]);
						} catch(e) {
							errors.push("Error importing " + patternName + " (" + tuneName + "): " + e.message);
						}
					}
				}
			}

			if(object.songs) {
				ret.songs.push.apply(ret.songs, bbSongEncoder.decodeSongs(object.songs));

				ret.songs.forEach(function(song) {
					var length = bbUtils.getMaxIndex(song);
					var missing = [ ];
					for(var beatIdx=0; beatIdx<length; beatIdx++) {
						if(!song[beatIdx])
							continue;

						for(var instr in bbConfig.intruments) {
							var pattern = song[beatIdx][instr];
							if(!pattern)
								continue;

							if(!bbUtils.getPattern(ret.tunes, pattern) && !bbUtils.getPattern(bbConfig.tunes, pattern) && missing.indexOf(pattern.join(" (") +")") == -1)
								missing.push(pattern.join(" (") +")");
						}
					}

					if(missing.length > 0)
						ret.errors.push("Warning: The following tunes/breaks are used in song “" + (song.name || "Untitled song") + "” but could not be imported: " + missing.join(", "));
				});
			}

			return ret;
		},

		decodeString : function(string) {
			return JSON.parse(JSZip.compressions.DEFLATE.decomress(JSZip.base64.decode(string).replace(/-/g, '+').replace(/_/g, '/').replace(/\./g, '=')));
		},

		importString : function(string) {
			return this.importObject(this.decodeString(string));
		}
	};
	return bbImportExport;
});