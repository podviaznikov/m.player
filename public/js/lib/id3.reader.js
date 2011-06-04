ID3v2 =
{
	parseStream: function(stream, onComplete)
    {

	var TAGS =
    {
    "TALB": "album",
    "TCON": "genre",
    "TDAT": "date",
    "TEXT": "Lyricist",
    "TFLT": "File type",
    "TIME": "time",
    "TIT2": "title",
    "TLAN": "Language(s)",
    "TLEN": "length",
    "TMED": "Media type",
    "TOAL": "Original album",
    "TOFN": "Original filename",
    "TOLY": "Original lyricist",
    "TOPE": "Original artist",
    "TORY": "Original release year",
    "TOWN": "File owner",
    "TPE1": "artist",
    "TPE2": "Band",
    "TPOS": "Part of a set",
    "TRCK": "track",
    "TSIZ": "size",
    "TYER": "year",
    "UFID": "Unique file identifier"
  };
  
	var TAG_MAPPING_2_2_to_2_3 = {
    "BUF": "RBUF",
    "COM": "COMM",
    "CRA": "AENC",
    "EQU": "EQUA",
    "ETC": "ETCO",
    "GEO": "GEOB",
    "MCI": "MCDI",
    "MLL": "MLLT",
    "PIC": "APIC",
    "POP": "POPM",
    "REV": "RVRB",
    "RVA": "RVAD",
    "SLT": "SYLT",
    "STC": "SYTC",
    "TAL": "TALB",
    "TBP": "TBPM",
    "TCM": "TCOM",
    "TCO": "TCON",
    "TCR": "TCOP",
    "TDA": "TDAT",
    "TDY": "TDLY",
    "TEN": "TENC",
    "TFT": "TFLT",
    "TIM": "TIME",
    "TKE": "TKEY",
    "TLA": "TLAN",
    "TLE": "TLEN",
    "TMT": "TMED",
    "TOA": "TOPE",
    "TOF": "TOFN",
    "TOL": "TOLY",
    "TOR": "TORY",
    "TOT": "TOAL",
    "TP1": "TPE1",
    "TP2": "TPE2",
    "TP3": "TPE3",
    "TP4": "TPE4",
    "TPA": "TPOS",
    "TPB": "TPUB",
    "TRC": "TSRC",
    "TRD": "TRDA",
    "TRK": "TRCK",
    "TSI": "TSIZ",
    "TSS": "TSSE",
    "TT1": "TIT1",
    "TT2": "TIT2",
    "TT3": "TIT3",
    "TXT": "TEXT",
    "TXX": "TXXX",
    "TYE": "TYER",
    "UFI": "UFID",
    "ULT": "USLT",
    "WAF": "WOAF",
    "WAR": "WOAR",
    "WAS": "WOAS",
    "WCM": "WCOM",
    "WCP": "WCOP",
    "WPB": "WPB",
    "WXX": "WXXX"
  };
  
  //pulled from http://www.id3.org/id3v2-00 and changed with a simple replace
  //probably should be an array instead, but thats harder to convert -_-
  var ID3_2_GENRES = {
		"0": "Blues",
		"1": "Classic Rock",
		"2": "Country",
		"3": "Dance",
		"4": "Disco",
		"5": "Funk",
		"6": "Grunge",
		"7": "Hip-Hop",
		"8": "Jazz",
		"9": "Metal",
		"10": "New Age",
		"11": "Oldies",
		"12": "Other",
		"13": "Pop",
		"14": "R&B",
		"15": "Rap",
		"16": "Reggae",
		"17": "Rock",
		"18": "Techno",
		"19": "Industrial",
		"20": "Alternative",
		"21": "Ska",
		"22": "Death Metal",
		"23": "Pranks",
		"24": "Soundtrack",
		"25": "Euro-Techno",
		"26": "Ambient",
		"27": "Trip-Hop",
		"28": "Vocal",
		"29": "Jazz+Funk",
		"30": "Fusion",
		"31": "Trance",
		"32": "Classical",
		"33": "Instrumental",
		"34": "Acid",
		"35": "House",
		"36": "Game",
		"37": "Sound Clip",
		"38": "Gospel",
		"39": "Noise",
		"40": "AlternRock",
		"41": "Bass",
		"42": "Soul",
		"43": "Punk",
		"44": "Space",
		"45": "Meditative",
		"46": "Instrumental Pop",
		"47": "Instrumental Rock",
		"48": "Ethnic",
		"49": "Gothic",
		"50": "Darkwave",
		"51": "Techno-Industrial",
		"52": "Electronic",
		"53": "Pop-Folk",
		"54": "Eurodance",
		"55": "Dream",
		"56": "Southern Rock",
		"57": "Comedy",
		"58": "Cult",
		"59": "Gangsta",
		"60": "Top 40",
		"61": "Christian Rap",
		"62": "Pop/Funk",
		"63": "Jungle",
		"64": "Native American",
		"65": "Cabaret",
		"66": "New Wave",
		"67": "Psychadelic",
		"68": "Rave",
		"69": "Showtunes",
		"70": "Trailer",
		"71": "Lo-Fi",
		"72": "Tribal",
		"73": "Acid Punk",
		"74": "Acid Jazz",
		"75": "Polka",
		"76": "Retro",
		"77": "Musical",
		"78": "Rock & Roll",
		"79": "Hard Rock",
		"80": "Folk",
		"81": "Folk-Rock",
		"82": "National Folk",
		"83": "Swing",
		"84": "Fast Fusion",
		"85": "Bebob",
		"86": "Latin",
		"87": "Revival",
		"88": "Celtic",
		"89": "Bluegrass",
		"90": "Avantgarde",
		"91": "Gothic Rock",
		"92": "Progressive Rock",
		"93": "Psychedelic Rock",
		"94": "Symphonic Rock",
		"95": "Slow Rock",
		"96": "Big Band",
		"97": "Chorus",
		"98": "Easy Listening",
		"99": "Acoustic",
		"100": "Humour",
		"101": "Speech",
		"102": "Chanson",
		"103": "Opera",
		"104": "Chamber Music",
		"105": "Sonata",
		"106": "Symphony",
		"107": "Booty Bass",
		"108": "Primus",
		"109": "Porn Groove",
		"110": "Satire",
		"111": "Slow Jam",
		"112": "Club",
		"113": "Tango",
		"114": "Samba",
		"115": "Folklore",
		"116": "Ballad",
		"117": "Power Ballad",
		"118": "Rhythmic Soul",
		"119": "Freestyle",
		"120": "Duet",
		"121": "Punk Rock",
		"122": "Drum Solo",
		"123": "A capella",
		"124": "Euro-House",
		"125": "Dance Hall"
		};
		
	var tag = {};
	
	
	var max_size = Infinity;
	
	function read(bytes, callback){
		stream(bytes, callback, max_size);
	}


	function parseDuration(ms){
		var msec = parseInt(cleanText(ms)) //leading nulls screw up parseInt
		var secs = Math.floor(msec/1000);
		var mins = Math.floor(secs/60);
		var hours = Math.floor(mins/60);
		var days = Math.floor(hours/24);
	
		return {
			milliseconds: msec%1000,
			seconds: secs%60,
			minutes: mins%60,
			hours: hours%24,
			days: days
		};
	}


	function pad(num){
		var arr = num.toString(2);
		return (new Array(8-arr.length+1)).join('0') + arr;
	}

	function arr2int(data){
		if(data.length == 4){
			if(tag.revision > 3){
				var size = data[0] << 0x15;
				size += data[1] << 14;
				size += data[2] << 7;
				size += data[3];
			}else{
				var size = data[0] << 24;
				size += data[1] << 16;
				size += data[2] << 8;
				size += data[3];
			}
		}else{
			var size = data[0] << 16;
			size += data[1] << 8;
			size += data[2];
		}
		return size;
	}


	var TAG_HANDLERS = {
		"TLEN": function(size, s, a){
			tag.Length = parseDuration(s);
		},
		"TCON": function(size, s, a){
			s = cleanText(s);
			if(/\([0-9]+\)/.test(s)){
				var genre = ID3_2_GENRES[parseInt(s.replace(/[\(\)]/g,''))]
			}else{
				var genre = s;
			}
			tag.genre = genre;
		}
	};

	function read_frame(){
		if(tag.revision < 3){
			read(3, function(frame_id){
				console.log(frame_id)
				if(/[A-Z0-9]{3}/.test(frame_id)){
					var new_frame_id = TAG_MAPPING_2_2_to_2_3[frame_id.substr(0,3)];
					read_frame2(frame_id, new_frame_id);
				}else{
					onComplete(tag);
					return;
				}
			})
		}else{
			read(4, function(frame_id){
				console.log(frame_id)
				if(/[A-Z0-9]{4}/.test(frame_id)){
					read_frame3(frame_id);
				}else{
					onComplete(tag);
					return;
				}
			})
		}
	}
	
	
	function cleanText(str){
		if(str.indexOf('http://') != 0){
			var TextEncoding = str.charCodeAt(0);
			str = str.substr(1);
		}
		//screw it i have no clue
		return str.replace(/[^A-Za-z0-9\(\)\{\}\[\]\!\@\#\$\%\^\&\* \/\"\'\;\>\<\?\,\~\`\.\n\t]/g,'');
	}
	
	
	function read_frame3(frame_id){
		read(4, function(s, size){
			var intsize = arr2int(size);
			read(2, function(s, flags){
				flags = pad(flags[0]).concat(pad(flags[1]));
				read(intsize, function(s, a){
					if(typeof TAG_HANDLERS[frame_id] == 'function'){
						TAG_HANDLERS[frame_id](intsize, s, a);
					}else if(TAGS[frame_id]){
						tag[TAGS[frame_id]] = (tag[TAGS[frame_id]]||'') + cleanText(s)
					}else{
						tag[frame_id] = cleanText(s)
					}
					read_frame();
				})
			})
		})
	}
	
	function read_frame2(v2ID, frame_id){
		read(3, function(s, size){
			var intsize = arr2int(size);
			read(intsize, function(s, a){
				if(typeof TAG_HANDLERS[v2ID] == 'function'){
					TAG_HANDLERS[v2ID](intsize, s, a);
				}else if(typeof TAG_HANDLERS[frame_id] == 'function'){
					TAG_HANDLERS[frame_id](intsize, s, a);
				}else if(TAGS[frame_id]){
					tag[TAGS[frame_id]] = (tag[TAGS[frame_id]]||'') + cleanText(s)
				}else{
						tag[frame_id] = cleanText(s)
					}
									console.log(tag)
				read_frame();
			})
		})
	}
	
	
	read(3, function(header){
		if(header == "ID3"){
			read(2, function(s, version){
				read(1, function(s, flags){
					//todo: parse flags
					flags = pad(flags[0]);
					read(4, function(s, size){
						max_size = arr2int(size);
						read(0, function(){}); //signal max
						read_frame()
					})
				})
			})
		}else{
			onComplete(tag);
			return false; //no header found
		}
	})
	return tag;
},

parseFile: function(binData, onComplete)
{
	var pos = 0,
			bits_required = 0, 
			handle = function(){},
			maxdata = Infinity;

	function read(bytes, callback, newmax)
    {
		bits_required = bytes;
		handle = callback;
		maxdata = newmax;
		if(bytes == 0) callback('',[]);
	}
	var responseText = '';
	(function(){
		if(binData){
			responseText = binData;
		}

		if(responseText.length > pos + bits_required && bits_required){
			var data = responseText.substr(pos, bits_required);
			var arrdata = data.split('').map(function(e){return e.charCodeAt(0) & 0xff});
			pos += bits_required;
			bits_required = 0;
			if(handle(data, arrdata) === false){
				return;
			}
		}
		setTimeout(arguments.callee, 0);
	})()
	return [ID3v2.parseStream(read, onComplete)];
}
}
