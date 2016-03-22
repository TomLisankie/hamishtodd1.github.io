var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var pictures_imported = Array(0,0,0,0, 0,0,0,0);

var section_finishing_time = Array(29,177,295,548,738,909,animation_beginning_second,99999999999);
var pausing_times = Array(36.3,185,321.3,550,747.9,931);
var secondsthroughvid = 0;

var texture_loader = new THREE.TextureLoader();

var picture_properties = Array(8);

picture_properties[0] = {}; picture_properties[0].name = "Data/1 - BV.jpg";
picture_properties[1] = {}; picture_properties[1].name = "Data/3 - PV.png";
picture_properties[2] = {}; picture_properties[2].name = "Data/4 - SFV.png";
picture_properties[3] = {};	picture_properties[3].name = "Data/7 - CV.png";
picture_properties[4] = {}; picture_properties[4].name = "Data/9 - N4.gif";
picture_properties[5] = {};	picture_properties[5].name = "Data/12 - RVFV.png";
picture_properties[6] = {}; picture_properties[6].name = "Data/13 - RV.png";
picture_properties[7] = {}; picture_properties[7].name = "Data/warning.png";

var picture_loaded = 0;

function loadpic(i) {
	console.log(i);
	texture_loader.load(
		picture_properties[i].name,
		function(texture) {
			var mywidth = 3;
			if(picture_loaded<7){
				var myscale = 2;
				picture_objects[picture_loaded] = new THREE.Mesh(new THREE.CubeGeometry(mywidth , mywidth , 0),new THREE.MeshBasicMaterial({map: texture, transparent:true}) );

				picture_objects[picture_loaded].position.x = -playing_field_width / 2 + 1.2;
				picture_objects[picture_loaded].position.y = playing_field_width / 2 - 1.2;
				picture_objects[picture_loaded].position.z = 0.01;
			}
			else{
				picture_objects[picture_loaded] = new THREE.Mesh(new THREE.CubeGeometry(playing_field_width, playing_field_width, 0),new THREE.MeshBasicMaterial({map: texture}) );
			}
			//so they're offscreen by default
			
			console.log(picture_loaded);
			picture_loaded++;

			if(picture_loaded < picture_properties.length )
				loadpic(picture_loaded);
			else {
				console.log("done");

				//ready to rock!
				MODE = 0;
				init(); //TODO call this before you start loading the pictures
				scene.add(picture_objects[7]);
				render();
			}
		},
		function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
	);
}

function react_to_video(){
	/* Note that it is *finishing* time
	 * the second one is the time that we want the break-apart to BEGIN
	 * the opening of the QC is also when that animation will begin
	 * 
	 * with both QC and DNA, if the player goes into any other section, we should reset their coords
	 */
//	var section_finishing_time = new Uint16Array([34,182,300,553,743,914,99999999999]);
//	var pausing_times = new Uint16Array([54,213,326,555,752,944]);
	
	var timeupdate = ytplayer.getCurrentTime();
	if(timeupdate != Math.floor(secondsthroughvid) ){
		var discrepancy = timeupdate - Math.floor(secondsthroughvid);
		if(discrepancy == 1) //a very normal update
			secondsthroughvid = timeupdate;
		else if(discrepancy > 1 ) //either our framerate is completely hopeless or they skipped ahead
			secondsthroughvid = timeupdate;
		else if(discrepancy == -1) //we've gone a full second ahead, so maybe they've paused or our delta_t's are more than the sum of their parts. Hopefully they'll catch up
			secondsthroughvid = Math.floor(secondsthroughvid);
		else if(discrepancy < -1) //they've gone back, we should follow
			secondsthroughvid = timeupdate;
		//if it's 0 then things are as normal
		//there are much better ways of checking for a pause but this is not hugely important
	}
	secondsthroughvid += delta_t;
		
	for(var i = 0; i < section_finishing_time.length /*or whichever mode is last*/; i++) {
		if( section_finishing_time[i-1] <= secondsthroughvid && secondsthroughvid < section_finishing_time[i] && MODE != i)
			ChangeScene(i);
	}
	for(var i = 0; i < pausing_times.length /*or whichever mode is last*/; i++) {
		if( pausing_times[i] <= secondsthroughvid && secondsthroughvid < pausing_times[i] + 1 ){
			pausing_times[i] = -1; //won't need that again
			ytplayer.pauseVideo();
		}
	}
}

function onPlayerReady(event) {
	//start importing all pictures
	loadpic(0);
}

/* _MF2DVU8oB0: tall video
 * lDMaeDoSNvM: test video
 * 8JndSqOn9ac: Robin video
 * Xa_m6yggMdU: V2 video
 * D_DkCTT8azI: V2 resized
 * 7JlMIJKTUVc: final v2
 */
function onYouTubeIframeAPIReady(){
	ytplayer = new YT.Player('player', {
		videoId:'7JlMIJKTUVc',
		height: window_height,
		width: window_height / 3 * 4,//9:16 is probably pushing it too far, but you should try it
		events: {
	        'onReady': onPlayerReady
	    },
		playerVars: {
			autoplay: 1,
//			controls: 0,
			fs: 0,
			rel: 0,
			showinfo: 0,
			modestbranding: 1,
		}
	});
}