/*
 * JavaScript ID3 Tag Reader 0.1.2
 * Copyright (c) 2008 Jacob Seidelin, cupboy@gmail.com, http://blog.nihilogic.dk/
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 * Modified by Anton Podviaznikov <podviaznikov@gmail.com>
 */

var ID3 = {};
var BinaryFile = function(strData)
{
	this.offset = strData.length-128;

    this.getByteAt = function(iOffset)
    {
        return strData.charCodeAt(iOffset) & 0xFF;
    }

	this.getStringAt = function(iOffset, iLength)
	{
		var aStr = [];
		for (var i=iOffset,j=0;i<iOffset+iLength;i++,j++)
		{
			aStr[j] = String.fromCharCode(this.getByteAt(i));
		}
		return aStr.join('');
	}
	//methods for ID3v2
	this.isBitSetAt = function(iOffset, iBit)
	{
        var iByte = this.getByteAt(iOffset);
        return (iByte & (1 << iBit)) != 0;
    }

    this.getLongAt = function(iOffset, bBigEndian)
    {
		var iByte1 = this.getByteAt(iOffset),
			iByte2 = this.getByteAt(iOffset + 1),
			iByte3 = this.getByteAt(iOffset + 2),
			iByte4 = this.getByteAt(iOffset + 3);

		var iLong = bBigEndian ?
			(((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
			: (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
		if (iLong < 0) iLong += 4294967296;
		return iLong;
	}
};

(function()
{
	ID3.genres = [
		"Blues","Classic Rock","Country","Dance","Disco","Funk","Grunge",
		"Hip-Hop","Jazz","Metal","New Age","Oldies","Other","Pop","R&B",
		"Rap","Reggae","Rock","Techno","Industrial","Alternative","Ska",
		"Death Metal","Pranks","Soundtrack","Euro-Techno","Ambient",
		"Trip-Hop","Vocal","Jazz+Funk","Fusion","Trance","Classical",
		"Instrumental","Acid","House","Game","Sound Clip","Gospel",
		"Noise","AlternRock","Bass","Soul","Punk","Space","Meditative",
		"Instrumental Pop","Instrumental Rock","Ethnic","Gothic",
		"Darkwave","Techno-Industrial","Electronic","Pop-Folk",
		"Eurodance","Dream","Southern Rock","Comedy","Cult","Gangsta",
		"Top 40","Christian Rap","Pop/Funk","Jungle","Native American",
		"Cabaret","New Wave","Psychadelic","Rave","Showtunes","Trailer",
		"Lo-Fi","Tribal","Acid Punk","Acid Jazz","Polka","Retro",
		"Musical","Rock & Roll","Hard Rock","Folk","Folk-Rock",
		"National Folk","Swing","Fast Fusion","Bebob","Latin","Revival",
		"Celtic","Bluegrass","Avantgarde","Gothic Rock","Progressive Rock",
		"Psychedelic Rock","Symphonic Rock","Slow Rock","Big Band",
		"Chorus","Easy Listening","Acoustic","Humour","Speech","Chanson",
		"Opera","Chamber Music","Sonata","Symphony","Booty Bass","Primus",
		"Porn Groove","Satire","Slow Jam","Club","Tango","Samba",
		"Folklore","Ballad","Power Ballad","Rhythmic Soul","Freestyle",
		"Duet","Punk Rock","Drum Solo","Acapella","Euro-House","Dance Hall"
	];

    function getTagReader(data)
    {
        // FIXME: improve this detection according to the spec
        return data.getStringAt(4, 7) == "ftypM4A" ? 'ID4' :
               (data.getStringAt(0, 3) == "ID3" ? 'ID3v2' : 'ID3v1');
    }
	function readTagsFromData(data)
	{
		var offset = data.offset;

        var tagReader = getTagReader(data);

        console.log('TAG reader');
        console.log(tagReader);
        //ID3v2.loadData(data,function()
       // {
        //    var tags = ID3v2.readTagsFromData(data);
        //    console.log(tags);
       // });


		var header = data.getStringAt(offset, 3);
		if (header == 'TAG')
		{
			var title = data.getStringAt(offset + 3, 30).replace(/\0/g, '');
			var artist = data.getStringAt(offset + 33, 30).replace(/\0/g, '');
			var album = data.getStringAt(offset + 63, 30).replace(/\0/g, '');
			var year = data.getStringAt(offset + 93, 4).replace(/\0/g, '');

			var trackFlag = data.getByteAt(offset + 97 + 28);
			if (trackFlag == 0)
			{
				var comment = data.getStringAt(offset + 97, 28).replace(/\0/g, '');
				var track = data.getByteAt(offset + 97 + 29);
			}
			else
			{
				var comment = '';
				var track = 0;
			}

			var genreIdx = data.getByteAt(offset + 97 + 30);
			if (genreIdx < 255)
			{
				var genre = ID3.genres[genreIdx];
			}
			else
			{
				var genre = '';
			}

			return {
				title : title.trim(),
				artist : artist.trim(),
				album : album.trim(),
				year : year,
				comment : comment.trim(),
				track : track,
				genre : genre
			}
		}
		else
		{
			return {};
		}
	}
    ID3.readTagsFromData=function(data)
    {
        return readTagsFromData(new BinaryFile(data));
    }

})();

