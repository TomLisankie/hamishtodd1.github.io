/*
	
*/

let scopeIsLimited = false

function initGoals(modeChange,restartButton)
{
	let victorySavouringTime = 2.
	let victorySavouringCounter = Infinity
	updateFunctions.push(function()
	{
		victorySavouringCounter -= frameDelta
		if( victorySavouringCounter < 0. )
			reactToVictory()
	})

	let youWinSign = text("Puzzle solved!")
	youWinSign.scale.multiplyScalar(.6)
	youWinSign.position.y = camera.topAtZZero - .4
	scene.add(youWinSign)

	let goalOutputGroup = ThingCollection()
	{
		function updateOutputGroupIntendedPosition()
		{
			// goalOutputGroup.intendedPosition.x = camera.rightAtZZero - inputGroup.background.scale.x/2. - .1

			goalOutputGroup.intendedPosition.copy(inputGroup.intendedPosition)
			goalOutputGroup.intendedPosition.x *= -1.
			goalOutputGroup.intendedPosition.y = camera.topAtZZero - goalOutputGroup.background.scale.y / 2.
		}
		updateOutputGroupIntendedPosition()
		goalOutputGroup.position.copy(goalOutputGroup.intendedPosition)
		updateFunctions.push(function()
		{
			updateOutputGroupIntendedPosition()

			if (victorySavouringCounter === Infinity && checkIfObjectIsInScene(goalOutputGroup))
			{
				let victorious = true
				for (let i = 0; i < goalOutputGroup.things.length; i++)
				{
					if (!equalsMultivector(goalOutputGroup.things[i].elements, outputGroup.things[i].elements))
						victorious = false
				}

				if (victorious)
					victorySavouringCounter = victorySavouringTime
			}
		})
	}

	initVideo(goalOutputGroup)

	let goalExcitedness = 0.
	reactToNewMultivector = function(newMultivector)
	{
		if(goalBox.parent === scene)
		{
			if( equalsMultivector(singularGoalMultivector.elements,newMultivector.elements) )
				victorySavouringCounter = victorySavouringTime
			goalExcitedness = 1.
		}

		if(outputGroup.parent === scene)
			outputScopeMultivectorIndex = multivectorScope.length-1
	}

	//singular goal
	{
		var goalBox = new THREE.Group()
		var singularGoalMultivector = MultivectorAppearance(function(){})
		goalBox.add(singularGoalMultivector)

		let defaultText = "Make this:"
		goalBox.title = text(defaultText)
		goalBox.title.scale.multiplyScalar(.5)
		goalBox.title.position.z = .01
		goalBox.add(goalBox.title)

		goalBox.background = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xffa500 }))
		goalBox.add(goalBox.background)
	}

	let restartInsistenceCounter = 0.
	updateFunctions.push(function ()
	{
		if (checkIfObjectIsInScene(goalBox))
		{
			let oscillating = .5 + .5 * Math.sin(frameCount * .14)

			goalExcitedness -= frameDelta * .75
			if (goalExcitedness < 0.)
				goalExcitedness = 0.
			singularGoalMultivector.position.x = goalExcitedness * .2 * Math.sin(frameCount * .3)
			goalBox.title.material.color.setRGB(1., 1. - goalExcitedness * oscillating, 1. - goalExcitedness * oscillating)

			if (victorySavouringCounter !== Infinity)
				goalBox.title.material.color.setRGB(1. - oscillating, 1., 1. - oscillating)

			goalBox.position.x = camera.rightAtZZero - 1.4
			goalBox.position.y = 0.

			goalBox.title.position.y = goalBox.title.scale.y / 2. + singularGoalMultivector.boundingBox.scale.y / 2.

			goalBox.background.scale.x = .2 + Math.max(goalBox.title.scale.x, singularGoalMultivector.boundingBox.scale.x)
			goalBox.background.scale.y = .2 + goalBox.title.scale.y + singularGoalMultivector.boundingBox.scale.y
			goalBox.background.position.y = .5 * goalBox.title.scale.y
		}

		if (checkIfObjectIsInScene(restartButton))
		{
			if ((multivectorScope.length < 2 || operatorScope.length < 1) && victorySavouringCounter === Infinity) //levelUncompletable
				restartInsistenceCounter += frameDelta
			else
				restartInsistenceCounter = 0.

			if(restartInsistenceCounter > 9.)
				restartButton.material.color.setRGB(1., .5 + .5 * Math.sin(frameCount * .12), .5 + .5 * Math.sin(frameCount * .12))
			else
				restartButton.material.color.setRGB(1., 1., 1.)
		}

		youWinSign.visible = victorySavouringCounter !== Infinity
	})

	let levels = Levels()
	levelSetUp = function()
	{
		victorySavouringCounter = Infinity
		let l = levels[levelIndex]

		setScope(l.options,l.operators)

		if(l.singularGoal !== undefined)
		{
			scene.add(goalBox)
			copyMultivector(l.singularGoal, singularGoalMultivector.elements)
			singularGoalMultivector.updateAppearance()

			scopeIsLimited = true
		}
		else
			scene.remove(goalBox)

		if( l.singularGoal === undefined)
		{
			scene.add(goalOutputGroup)
			scene.add(inputGroup, inputGroup.indicator)
			scene.add(outputGroup, outputGroup.indicator)

			inputGroup.clear()
			goalOutputGroup.clear()
			
			if (l.videoDetails === undefined)
			{
				for (let i = 0; i < l.inputs.length; i++)
					addInput(l.inputs[i])
			}
			else
			{
				let inputs = Array(l.videoDetails.markerTimes.length)
				for(let i = 0; i < l.videoDetails.markerTimes.length; i++)
				{
					let elements = new Float32Array([
						l.videoDetails.markerTimes[i] - l.videoDetails.startTime,
						0.,0.,0.,0.,0.,0.,0.])
					addInput(elements)

					//there to make space. The video doesn't currently end up on it
					//since we might not even be doing it this way!
					goalOutputGroup.addThing(MultivectorAppearance(selectInput, new Float32Array([
						0.,0., 0., 0., 0., 0., 0., 0.])))
				}
			}

			addInputScopeMultivectorToScope()

			scopeIsLimited = false
		}

		if(l.videoDetails !== undefined)
		{
			let outputPositions = Array(l.videoDetails.markerTimes.length)
			goalOutputGroup.background.scale.x *= 1.7
			
			for(let i = 0; i < l.videoDetails.markerTimes.length; i++)
				outputPositions[i] = outputGroup.things[i].position.clone().add(goalOutputGroup.position)

			setVideo(
				l.videoDetails.filename,
				l.videoDetails.startTime,
				l.videoDetails.endTime,
				l.videoDetails.markerTimes,
				outputPositions)
		}
		else if(l.steps !== undefined)
		{
			//compute the outputs
			let outputs = Array(l.inputs.length)
			let tempScope = []
			for(let i = 0; i < outputs.length; i++)
			{
				tempScope.push(l.inputs[i])
				for(let j = 0; j < l.options.length; j++)
					tempScope.push(l.options[j])

				for(let j = 0; j < l.steps.length; j++)
				{
					let s = l.steps[j]
					tempScope.push( s[0](tempScope[s[1]],tempScope[s[2]]) )
				}
				outputs[i] = tempScope[tempScope.length-1]
				for(let j = tempScope.length-1; j > -1; j--)
					delete tempScope[j]
				tempScope.length = 0
			}

			for (let i = 0; i < l.inputs.length; i++)
			{
				goalOutputGroup.addThing(
					MultivectorAppearance(function () { }, outputs[i])
				)
			}
		}
		else
		{
			scene.remove(
				inputGroup,
				goalOutputGroup,
				outputGroup,
				inputGroup.indicator,
				outputGroup.indicator )
		}
	}

	let levelIndex = -1;
	function reactToVictory()
	{
		levelIndex++
		if( levelIndex >= levels.length )
		{
			let sign = text("Well done! That's all the levels so far :)")
			sign.scale.multiplyScalar(.4)
			scene.add(sign)
			let countDown = 3.2;
			updateFunctions.push(function()
			{
				countDown -= frameDelta
				if(countDown < 0.)
					location.reload()
			})

			return
		}

		victorySavouringCounter = Infinity
		levelSetUp()
	}
	bindButton("l",reactToVictory)

	modeChange.campaign = function()
	{
		log("Campaign mode")

		levelIndex = -1;
		reactToVictory()

		//for now restart is only for campaign mode
		scene.add(restartButton)
	}
	modeChange.calculator = function()
	{
		log("Calculator mode")

		scene.remove(goalBox)
		scene.remove(restartButton)
		scene.remove(inputGroup,inputGroup.indicator,goalOutputGroup)

		scopeIsLimited = false

		//CHANGE_SCOPE
		setScope()
		ScopeMultivector(new Float32Array([3., 1., 1., 0., 0., 0., 0., 0.]), true)

		// ScopeMultivector(new Float32Array([ 3., 1., 1., 0., 0., 0., 0., 0.]), true)
		// ScopeMultivector(new Float32Array([ 2., 0., 0., 0., 0., 0., 0., 0.]), true)

		// ScopeMultivector(new Float32Array([ 0., 1., 1., 0., 0., 0., 0., 0.]), true)
		// ScopeMultivector(new Float32Array([ 1., 0., 0., 0., 0., 0., 0., 0.]), true)
		// ScopeMultivector(new Float32Array([-1., 0., 0., 0., 0., 0., 0., 0.]), true)
		// ScopeMultivector(new Float32Array([ 2., 0., 0., 0., 0., 0., 0., 0.]), true)

		// for(let i = 0; i < 3; i++)
		// {
		// 	ScopeMultivector(new Float32Array([Math.random() * 9, Math.random() * 4., Math.random() * 4., 0., Math.random() * 8, 0., 0., 0.]), true)
		// }
	}
	modeChange.shaderProgramming = function ()
	{
		log("Shader programming mode")

		//since it is good for doodling this may become your level editor

		scene.remove(goalBox)
		scene.remove(restartButton)

		scopeIsLimited = false

		setScope()

		scene.add(inputGroup, inputGroup.indicator)
		scene.add(outputGroup,outputGroup.indicator)
		
		inputGroup.clear()

		for (let i = 0; i < 3; i++)
			addInput(new Float32Array([0., 0., i * .4 + .2, 0., 0., 0., 0., 0.]))
		//need to forget about their positions so you can do the 2D thing

		//next thing: make it
		// for (let i = 0; i < 3; i++)
		// {
		// 	for(let j = 0; j < 3; j++)
		// 	{
		// 		addInput(new Float32Array([0., i * .5, j * .5, 0., 0., 0., 0., 0.]))
		// 	}
		// }

		addInputScopeMultivectorToScope()
		// scene.add(goalOutputGroup.line);

		
		// ScopeMultivector(new Float32Array([1., 0., 0., 0., 0., 0., 0., 0.]),true)
		
		//how to choose the bloody output from the scope
		//The output CAN be a list of individual multivectors. More generally it is a thing in a white box
	}
}