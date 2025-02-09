var theyknowyoucanchangestate = false;

function UpdateQuasiSurface()
{
	//-------Rotation
	//TODO saw it vibrate weirdly once?
	if(!isMouseDown && Story_states[Storypage].enforced_qs_quaternion.x === 5 ) {
		QS_rotationangle = Mouse_delta.length() / 2.5;
		
		QS_rotationaxis.set(-Mouse_delta.y, Mouse_delta.x, 0);
		dodeca.worldToLocal(QS_rotationaxis);
		QS_rotationaxis.normalize();
	}
	else {
		QS_rotationangle = 0;
	}
	
	dodeca.rotateOnAxis(QS_rotationaxis,QS_rotationangle);
	dodeca.updateMatrixWorld();
	
	//avoid the back face showing
	{
		var forwardvector = new THREE.Vector3(0,0,1);
		dodeca.worldToLocal( forwardvector );
		
		var face_centers_indices = Array(3,7,12,16,21,25,30,34,38,42);
		var closest_angle = dodeca.geometry.vertices[ 0 ].angleTo( forwardvector );
		var closest_index = 0;
		
		//0 is the one you swap with
		for(var i = 0; i < face_centers_indices.length; i++)
		{
			var potential_angle = dodeca.geometry.vertices[ face_centers_indices[i] ].angleTo( forwardvector );
			if( potential_angle < closest_angle )
			{
				closest_angle = potential_angle;
				closest_index = face_centers_indices[i];
			}
		}
		
		if(closest_index !== 0 )
		{
			var swap_axis = dodeca.geometry.vertices[ closest_index ].clone();
			swap_axis.add( dodeca.geometry.vertices[ 0 ] );
			swap_axis.normalize();
			dodeca.rotateOnAxis( swap_axis, Math.PI );
		}
	}
	
	//-----inflation
	var dodeca_squashingspeed = 0.05 * delta_t / 0.016;
	if(isMouseDown)
		dodeca_faceflatness += dodeca_squashingspeed;
	else
		dodeca_faceflatness -= dodeca_squashingspeed;
	
	if(dodeca_faceflatness > 1)
		dodeca_faceflatness = 1;
	if(dodeca_faceflatness < 0)
		dodeca_faceflatness = 0;
	
//	deduce_dodecahedron(0);
}

function update_QS_center()
{
	if(MODE ===QC_SPHERE_MODE)
		QS_center.position.z = camera.position.z - 30;
	else
		QS_center.position.z = camera.position.z - 8;
	QS_measuring_stick.position.copy( QS_center.position );
	
	if(MODE ===QC_SPHERE_MODE)
	{
		var flatnessWhereCenterFadesIn = 0.9;
		QS_center.material.opacity = dodeca_faceflatness < flatnessWhereCenterFadesIn ? 0 : 
			(dodeca_faceflatness - flatnessWhereCenterFadesIn)/(1-flatnessWhereCenterFadesIn);
	}
	else
	{
		var opacitychangerate = 0.07 * delta_t / 0.016;
		
		if(isMouseDown && MousePosition.distanceTo(IrregButton.position) > IrregButton.radius )
		{
			QS_center.material.opacity += opacitychangerate;
			if(QS_center.material.opacity > 1)
				QS_center.material.opacity = 1;
		}
		else 
		{
			QS_center.material.opacity -= opacitychangerate;
			if(QS_center.material.opacity < 0)
				QS_center.material.opacity = 0;
		}
	}
	
	if(!Mouse_delta.equals(THREE.zeroVector))
		QS_measuring_stick.children[0].material.color.b = 1; 
	else
		QS_measuring_stick.children[0].material.color.b -= delta_t * 1.5;
	if(QS_measuring_stick.children[0].material.color.b < 0)
		QS_measuring_stick.children[0].material.color.b = 0;
	
	QS_measuring_stick.children[0].material.opacity = QS_center.material.opacity; 
	
	QS_measuring_stick.rotation.copy(QS_center.rotation);
	
	if(MODE === CK_MODE)
		QS_measuring_stick.scale.y = MousePosition.length() * 0.0175; //last number chosen by inspection
	else
		QS_measuring_stick.scale.y = MousePosition.length() * 0.0233; //last number chosen by inspection
//	QS_measuring_stick.scale.x = QS_measuring_stick.scale.y / 1.7;
	
	QS_measuring_stick.rotation.z = Math.atan2(MousePosition.y,MousePosition.x) + TAU / 4;
	QS_center.rotation.z = QS_measuring_stick.rotation.z;
	
	if(MODE === CK_MODE && capsidopenness !== 1)
		QS_measuring_stick.children[0].material.opacity = 0;
}

var cutout_vector0_displayed = new THREE.Vector3();
function MoveQuasiLattice()
{
	//somewhere in here is the "ignoring input while inflating" bug
	//might do rotation whatevers here
	if( !isMouseDown )
	{
		QSmouseLowerLimit = -1;
		QSmouseUpperLimit = 999;
		
		if( isMouseDown_previously )
		{
			if( !Sounds.vertexReleased.isPlaying)
				Sounds.vertexReleased.play();
			if( !Sounds.shapeSettles.isPlaying )
			{
				Sounds.shapeSettles.volume = 1;
				Sounds.shapeSettles.currentTime = 0;
				Sounds.shapeSettles.play();
			}
		}
	}
	else {
		if(!isMouseDown_previously)
		{
			if(!Sounds.vertexGrabbed.isPlaying)
				Sounds.vertexGrabbed.play();
		}
		
		var Mousedist = MousePosition.length();
		var OldMousedist = OldMousePosition.length(); //unless the center is going to change?
		
		{
			var oldmouse_to_center = new THREE.Vector3(0 - OldMousePosition.x,0 - OldMousePosition.y,0);
			var oldmouse_to_newmouse = new THREE.Vector3(   MousePosition.x - OldMousePosition.x,     MousePosition.y - OldMousePosition.y,0);
			var ourangle = oldmouse_to_center.angleTo(oldmouse_to_newmouse);
			
			var veclength;
			
			if(Math.abs(ourangle) < TAU / 8 || Math.abs(ourangle) > TAU / 8 * 3 )
			{
				var scalefactor = 0;
				if( Mousedist < QSmouseLowerLimit )
				{
					scalefactor = 1;
					if( Mousedist / OldMousedist < 1 && !Sounds.sizeLimitLower.isPlaying)
						Sounds.sizeLimitLower.play();
				}
				else if( Mousedist > QSmouseUpperLimit )
				{
					scalefactor = 1;
					if( Mousedist / OldMousedist > 1 && !Sounds.sizeLimitUpper.isPlaying)
						Sounds.sizeLimitUpper.play();
				}
				else
					scalefactor = Mousedist / OldMousedist;
				
				scalefactor = (scalefactor - 1) * 0.685 +1; //0.685 is the drag
				var maxScaleFactor = 1.07;
				if(scalefactor > maxScaleFactor)
					scalefactor = maxScaleFactor;
				
				cutout_vector0_player.multiplyScalar(scalefactor);
				cutout_vector1_player.multiplyScalar(scalefactor);
				veclength = cutout_vector0_player.length();
				
				var hardmaxlength = 4;
				if(veclength > hardmaxlength) {
					veclength = hardmaxlength;

					if( !Sounds.sizeLimitUpper.isPlaying)
						Sounds.sizeLimitUpper.play();
				}
				var softmaxlength = 3.53; // 3.48 is minimum but that makes it hard to get to HPV
				if(veclength > softmaxlength)
				{
					veclength = softmaxlength;
					
					if( QSmouseUpperLimit === 999)
						QSmouseUpperLimit = Mousedist;

					if( !Sounds.sizeLimitUpper.isPlaying)
						Sounds.sizeLimitUpper.play();
				}
					
				var minlength = 1.313;
				if(veclength < minlength)
				{
					veclength = minlength;
					
					if( QSmouseLowerLimit === -1)
						QSmouseLowerLimit = Mousedist;
					
					if( !Sounds.sizeLimitLower.isPlaying)
						Sounds.sizeLimitLower.play();
				}
				
				if(veclength > cutout_vector0_player.length())
				{
					Sounds.rotateClockwise.play();
				}
				else
				{
					Sounds.rotateAntiClockwise.play();
				}
				
				cutout_vector0_player.setLength(veclength);
				cutout_vector1_player.setLength(veclength);
			}
			else
			{
				veclength = cutout_vector0_player.length();
				
				var MouseAngle = Math.atan2(MousePosition.y, MousePosition.x );
				if(MousePosition.x === 0 && MousePosition.y === 0)
					MouseAngle = 0; //well, undefined
				
				var OldMouseAngle = Math.atan2( OldMousePosition.y, OldMousePosition.x );
				if(OldMousePosition.x === 0 && OldMousePosition.y === 0)
					OldMouseAngle = 0;
				
				var LatticeAngleChange = OldMouseAngle - MouseAngle;
				var maxLatticeAngleChange = TAU / 60;
				if( Math.abs(LatticeAngleChange) > maxLatticeAngleChange )
				{
					if( LatticeAngleChange > 0 )
						LatticeAngleChange = maxLatticeAngleChange;
					else
						LatticeAngleChange =-maxLatticeAngleChange;
				}
					
				
				var QuasiLatticeAngle = Math.atan2(cutout_vector0_player.y, cutout_vector0_player.x);
				var newQuasiLatticeAngle = QuasiLatticeAngle + LatticeAngleChange;

				cutout_vector0_player.x = veclength * Math.cos(newQuasiLatticeAngle);
				cutout_vector0_player.y = veclength * Math.sin(newQuasiLatticeAngle);
				cutout_vector1_player.x = veclength * Math.cos(newQuasiLatticeAngle - TAU / 5);
				cutout_vector1_player.y = veclength * Math.sin(newQuasiLatticeAngle - TAU / 5);
			}
		}
	}
	
	var closest_stable_point_dist = 999;
	var closest_stable_point_index = 999;
	for( var i = 0; i < stable_points.length; i++){
		if( i % one_fifth_stablepoints < 2)
			continue; //These are the two distorted ones. They don't look so different from 0 so nobody will want them. Er, don't they have copies?
		if(	stable_points[i].distanceTo(cutout_vector0_player) < closest_stable_point_dist ) //so you sort of need to make sure that the one in the array is as low as possible
		{
			closest_stable_point_index = i;
			closest_stable_point_dist = stable_points[i].distanceTo(cutout_vector0_player);
			
			//you should be able to work out, here, how much to rotate cutout_vector0_player to get it close
		}
	}
	
	var modulated_CSP = closest_stable_point_index % (stable_points.length / 5);
	var closest_i = 999;
	var closest_dist = 1000;
	var testcutout = new THREE.Vector3();
	for(var i = 0; i < 5; i++)
	{
		testcutout.copy(cutout_vector0_player);
		testcutout.applyAxisAngle(z_central_axis, i * TAU/5);
		if(	testcutout.distanceTo(stable_points[modulated_CSP]) < closest_dist )
		{
			closest_i = i;
			closest_dist = testcutout.distanceTo(stable_points[modulated_CSP]);
		}
	}
	//this changes their location such that a different modulated_CSP is close! You need to do something such that it is not changed.
	cutout_vector0_player.applyAxisAngle(z_central_axis, closest_i * TAU/5);
	cutout_vector1_player.copy(cutout_vector0_player);
	cutout_vector1_player.applyAxisAngle(z_central_axis, -TAU/5);
	
	if( set_stable_point !== 999 )
	{
//		if(!isMouseDown && isMouseDown_previously){
//			set_stable_point++;
//			if(set_stable_point >= stable_points.length / 5)
//				set_stable_point = 0;
//			console.log(set_stable_point);
//		}
		modulated_CSP = set_stable_point;
	}
	
	cutout_vector0.copy(stable_points[modulated_CSP]);
	cutout_vector1.copy(cutout_vector0);
	cutout_vector1.applyAxisAngle(z_central_axis, -TAU/5);
	
	var interpolation_factor = 1 - dodeca_faceflatness;
	if(interpolation_factor == 1){ //if they've allowed it to expand, it's now officially snapped
		cutout_vector0_player.copy(cutout_vector0);
		cutout_vector1_player.copy(cutout_vector1);
		
		if(Sounds.shapeSettles.volume - 0.13333 < 0)//don't want this playing
			Sounds.shapeSettles.volume = 0;
		else
			Sounds.shapeSettles.volume -= 0.13333;
	}
	
	cutout_vector0_displayed.set(0,0,0)
	var cutout_vector1_displayed = new THREE.Vector3();
	cutout_vector0_displayed.lerpVectors(cutout_vector0_player, cutout_vector0, interpolation_factor);
	cutout_vector1_displayed.lerpVectors(cutout_vector1_player, cutout_vector1, interpolation_factor);
	var factor = cutout_vector1_displayed.y * cutout_vector0_displayed.x - cutout_vector1_displayed.x * cutout_vector0_displayed.y;
	quasi_shear_matrix[0] = cutout_vector1_displayed.y / factor;
	quasi_shear_matrix[1] = cutout_vector1_displayed.x /-factor;
	quasi_shear_matrix[2] = cutout_vector0_displayed.y /-factor;
	quasi_shear_matrix[3] = cutout_vector0_displayed.x / factor;
	
	//we want to remove the one that was previously in there, and add
	if( stable_point_of_meshes_currently_in_scene != modulated_CSP ){
		if(stable_point_of_meshes_currently_in_scene !== 999 )
			dodeca.remove(quasicutout_meshes[stable_point_of_meshes_currently_in_scene]);
		dodeca.add(quasicutout_meshes[modulated_CSP]);
		
		if( stable_point_of_meshes_currently_in_scene !== 999 && ytplayer.getPlayerState() !== 1 ) //not our first time
		{
			//a random pop
			playRandomPop();
			
			theyknowyoucanchangestate = true;
			
			camera.directionalShake.copy(MousePosition);
			camera.directionalShake.z = 0.1;
		}
		
		stable_point_of_meshes_currently_in_scene = modulated_CSP;
	}
	
	var minDist = 11;
	var maxDist = 50;
	camera.position.z = minDist + (maxDist-minDist) * dodeca_faceflatness;
	camera.fov = 2 * 360/TAU * Math.atan( 3 / (camera.position.z - dodeca.position.z) );
	camera.updateProjectionMatrix();
	camera.updateMatrix();
	camera.updateMatrixWorld();
}

function playRandomPop()
{
	var playedPop = "pop" + Math.ceil(Math.random()*3).toString();
	
	if( !Sounds[ playedPop ].isPlaying )
		Sounds[ playedPop ].play();
}

function deduce_dodecahedron(openness) {	
	var elevation = 0.5*Math.sqrt(5/2+11/10*Math.sqrt(5));
	
	dodeca.geometry.vertices[0].set(0,0,elevation);
	dodeca.geometry.vertices[1].set(0,0.5/Math.sin(TAU/10),elevation);
	dodeca.geometry.vertices[2].set(PHI/2,0.5/Math.sin(TAU/10) - Math.cos(3/20*TAU),elevation);
	
	var dihedral_angle = 2 * Math.atan(PHI);
	for( var i = 3; i < 46; i++) {
		var theta = TAU / 2;
		if( ((i - 3) % 9 === 0 && i <= 30) ||
			((i - 7) % 9 === 0 && i <= 34) ||
			i === 38 || i === 42
		   )
			theta = dihedral_angle + openness * (TAU/2 - dihedral_angle);
		
		var a_index = dodeca_derivations[i][0];
		var b_index = dodeca_derivations[i][1];
		var c_index = dodeca_derivations[i][2];
		
		var a = dodeca.geometry.vertices[a_index].clone(); //this is our origin
		
		var crossbar_unit = dodeca.geometry.vertices[b_index].clone();
		crossbar_unit.sub(a);			
		crossbar_unit.normalize();
	
		var c = dodeca.geometry.vertices[c_index].clone();
		c.sub(a);
		var hinge_origin_length = c.length() * get_cos(crossbar_unit, c);		
		var hinge_origin = new THREE.Vector3(
			crossbar_unit.x * hinge_origin_length,
			crossbar_unit.y * hinge_origin_length,
			crossbar_unit.z * hinge_origin_length);
		
		var c_hinge = new THREE.Vector3();
		c_hinge.subVectors( c, hinge_origin);
		var hinge_length = c_hinge.length();
		var hinge_component = c_hinge.clone();
		hinge_component.multiplyScalar( Math.cos(theta));
			
		var downward_vector_unit = new THREE.Vector3();		
		downward_vector_unit.crossVectors(crossbar_unit, c);
		downward_vector_unit.normalize();
		var downward_component = downward_vector_unit.clone();
		downward_component.multiplyScalar(Math.sin(theta) * hinge_length);
		
		dodeca.geometry.vertices[i].addVectors(downward_component, hinge_component);
		dodeca.geometry.vertices[i].add( hinge_origin );
		dodeca.geometry.vertices[i].add( a );
	}
	
	dodeca.geometry.vertices[46].copy(dodeca.geometry.vertices[0]);
	dodeca.geometry.vertices[46].negate();
}

function remove_stable_point_and_its_rotations(unwanted_index){
	var rotations = Array(5);
	rotations[0] = stable_points[unwanted_index].clone();
	for(var i = 1; i < 5; i++){
		rotations[i] = rotations[0].clone();
		rotations[i].applyAxisAngle(z_central_axis,TAU/5 * i);
	}
	var number_removed = 0;
	for(var j = 0; j < 5; j++){
		for(var i = stable_points.length-1; i >= 0; i--){
			if(	Math.abs(rotations[j].x - stable_points[i].x) < 0.00001 &&
				Math.abs(rotations[j].y - stable_points[i].y) < 0.00001 ) {
				if(i < unwanted_index){
					console.log(unwanted_index,i)
					console.log(stable_points[i].length());
					console.log(stable_points[unwanted_index].length());
				}
				
				stable_points.splice(i,1);
				number_removed++;
			}
		}
	}
	if(number_removed != 5)
		console.log("stable point had a number of copies not equal to 5? Number removed: " + number_removed);
}