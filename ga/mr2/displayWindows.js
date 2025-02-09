/* 
    More Bret Victorian
        The idea of the buttons is that, one day, you go into point-creating mode and click on an intersection and it creates the code that does that

    You want to specify which objects your thing is a result of
    Also specify what type the thing you want has
    Ok, 

    Would be nice if: the function signature puts into the dw the inputs and outputs and probably the constants it uses too

    If you edit in the carat dw, the edits apply to whatever the carat is immediately after
        ie, potentially, the thing you just created by clicking
 */

function displayWindowXyTo3dDirection(x, y, target) {
    let mouseDistFromCenter = Math.sqrt(sq(x) + sq(y))
    let placeInWaveRing = mouseDistFromCenter
    
    placeInWaveRing = clamp(placeInWaveRing,0.,1.)
    // while (placeInWaveRing > 4.)
    //     placeInWaveRing -= 4.

    if (1. < placeInWaveRing && placeInWaveRing < 3.) {
        var onscreenDistFromCenter = 2. - placeInWaveRing
        var z = Math.sqrt(1. - sq(onscreenDistFromCenter))
    }
    else {
        var onscreenDistFromCenter = placeInWaveRing > 3. ? placeInWaveRing - 4. : placeInWaveRing
        var z = -Math.sqrt(1. - sq(onscreenDistFromCenter))
    }

    let ratio = mouseDistFromCenter === 0 ? 1. : onscreenDistFromCenter / mouseDistFromCenter

    let untransformed = nonAlgebraTempMv0
    point(untransformed, x * ratio, y * ratio, z, 0.)
    sandwichBab(nonAlgebraTempMv0, inverseViewRotor, target)
}

function initExperiment() {
    /*
        it would be good to have shadows. And fun to do so fuck you
            so you're gonna do rendering to off screen buffer aight
        shading
            makes sense for planes. Could make points balls and lines cylinders
        you need perspective so time for perspective projection. Really perspective projection in the dw but not otherwise?
            it's not a DUMB idea because the space is much larger in these things
        could even have image defocus, look in buffer b of selfie girl

        SDF:
            Looks nice, softness
            Self shadowing/shadowing on each other, that's quite big
        Not sdf:
            Remember you can get nice coloring shading without thingy
            With sdf you have to concatenate everyone's fucking function into a single fucking shader jesus
                How would that work? Maybe not that hard given you're forgetting about colors
                "Just" have an array of points(spheres), cylinders, planes
            more flexible

        Probably you just need the one light pass, just make the light quite far away

        //the above is nicely done with sdfs, for sure!
    */
}

function initDisplayWindows() {
    let dimension = 5.; //hacky, no reason for 

    //background
    {
        const vsSource = 
            cameraAndFrameCountShaderStuff.header + `
            attribute vec4 vertA;
            uniform vec2 screenPosition;

            uniform float dwOriginZ;

            void main(void) {
                gl_Position = vertA;
                gl_Position.xy *= `+ toGlslFloatLiteral(dimension) + `;
                gl_Position.xy += screenPosition;
                gl_Position.z = -dwOriginZ + .5 * `+ toGlslFloatLiteral(dimension) + `;
            `
            + cameraAndFrameCountShaderStuff.footer
        const fsSource = 
            cameraAndFrameCountShaderStuff.header + `
            void main(void) {
                gl_FragColor = vec4(.45,.45,.45,1.);
            }
            `

        var backgroundProgram = new Program(vsSource, fsSource)
        backgroundProgram.addVertexAttribute("vert", 4, quadBuffer)
        cameraAndFrameCountShaderStuff.locateUniforms(backgroundProgram)
        backgroundProgram.locateUniform("screenPosition")

        backgroundProgram.locateUniform("dwOriginZ")
    }

    const mousePositionInWindow = new ScreenPosition()
    function DisplayWindow() {
        this.position = new ScreenPosition(2000.,2000.)
        this.dimension = dimension
        this.slideOngoing = false

        this.collectionY = Infinity
        this.collection = []

        this.editingStyle = null
        this.editingName = ""

        const self = this
        mouseResponses.push({
            z: () => {
                if (self.mouseIsInside())
                    return Infinity
                else
                    return -Infinity
            },
            start: () => {
                self.potentiallyEdit("start")
                self.slideOngoing = true
            },
            during: () => {
                self.potentiallyEdit("during")
            },
            end: () => {
                self.potentiallyEdit("end")
                self.slideOngoing = false
            },
        })

        displayWindows.push(this)
    }
    Object.assign( DisplayWindow.prototype, {

        potentiallyEdit: function (section) {
            if( this.editingStyle !== null && this.editingStyle[section] !== undefined) {
                this.getPositionInWindow(mousePositionInWindow)
                this.editingStyle[section](this.editingName, mousePositionInWindow.x * RADIUS_IN_BOX, mousePositionInWindow.y * RADIUS_IN_BOX)
            }
        },

        render: function(drawBackground) {
            
            if ( drawBackground ) {
                gl.useProgram(backgroundProgram.glProgram)
                cameraAndFrameCountShaderStuff.transfer(backgroundProgram)
                backgroundProgram.prepareVertexAttribute("vert")
                gl.uniform2f(backgroundProgram.getUniformLocation("screenPosition"), this.position.x, this.position.y);

                gl.uniform1f(backgroundProgram.getUniformLocation("dwOriginZ"), dwOriginZ())

                gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
            }

            renderAxes(this.position.x,this.position.y)
        },
        getPositionInWindow: function(target) {
            target.x = (mouse.position.x - this.position.x) / (dimension / 2.)
            target.y = (mouse.position.y - this.position.y) / (dimension / 2.)
        },
        mouseIsInside: function() {
            return mouse.inBounds(
                this.position.x - dimension/2.,
                this.position.x + dimension/2.,
                this.position.y + dimension/2.,
                this.position.y - dimension/2.)
        }
    })

    //////////////
    // GRID     //
    //////////////
    {
        const numDivisions = 4
        let gridBuffer = new Float32Array(4 * 2 * (numDivisions + 1) * 2 + 8)

        let gridSize = dimension / 4.

        let vertIndex = 0
        for (let horizontal = 0; horizontal < 2; ++horizontal) {
            for (let i = 0; i <= numDivisions; ++i) {
                for (let end = 0; end < 2; ++end) {
                    gridBuffer[vertIndex * 4 + 0] = 0.
                    gridBuffer[vertIndex * 4 + 1] = 0.
                    gridBuffer[vertIndex * 4 + 2] = 0.
                    gridBuffer[vertIndex * 4 + 3] = 1.

                    let coordIndexEnds = horizontal ? 0 : 2
                    gridBuffer[vertIndex * 4 + coordIndexEnds] = (end ? -1. : 1.) * gridSize
                    let coordIndexLayer = horizontal ? 2 : 0
                    gridBuffer[vertIndex * 4 + coordIndexLayer] = ((i / numDivisions - .5) * 2.) * gridSize

                    ++vertIndex
                }
            }
        }

        gridBuffer[vertIndex * 4 + 0] = 0.
        gridBuffer[vertIndex * 4 + 1] = 1. * gridSize
        gridBuffer[vertIndex * 4 + 2] = 0.
        gridBuffer[vertIndex * 4 + 3] = 1.
        ++vertIndex
        gridBuffer[vertIndex * 4 + 0] = 0.
        gridBuffer[vertIndex * 4 + 1] = -1. * gridSize
        gridBuffer[vertIndex * 4 + 2] = 0.
        gridBuffer[vertIndex * 4 + 3] = 1.

        const vs = cameraAndFrameCountShaderStuff.header + gaShaderString + `
            attribute vec4 vertA;

            uniform float viewRotor[16];

            uniform vec2 screenPosition;

            uniform float dwOriginZ;
            
            void main(void) {
                pointToMv(vertA,mv0);
                sandwichBab(mv0,viewRotor,mv1);
                mvToPoint(mv1,gl_Position);

                gl_Position.xy += screenPosition;
                gl_Position.z += -dwOriginZ;
            ` + cameraAndFrameCountShaderStuff.footer
        const fs = cameraAndFrameCountShaderStuff.header + `
            void main(void) {
                gl_FragColor = vec4(0.,1.,0.,1.);
            }
            `

        let program = new Program(vs, fs)
        program.addVertexAttribute("vert", 4,gridBuffer)
        cameraAndFrameCountShaderStuff.locateUniforms(program)

        program.locateUniform("viewRotor")
        program.locateUniform("screenPosition")

        program.locateUniform("dwOriginZ")

        function renderAxes(x, y) {
            gl.useProgram(program.glProgram)
            cameraAndFrameCountShaderStuff.transfer(program)
            program.prepareVertexAttribute("vert")

            gl.uniform1fv(program.getUniformLocation("viewRotor"), viewRotor)
            gl.uniform2f(program.getUniformLocation("screenPosition"), x, y)

            gl.uniform1f(program.getUniformLocation("dwOriginZ"), dwOriginZ())

            gl.drawArrays(gl.LINES, 0, gridBuffer.length / 4)
        }
    }
    
    //////////////
    // MOUSE DW //
    //////////////
    if (MODE !== PRESENTATION_MODE) {

        mouseDw = new DisplayWindow()
        mouseDw.placeBasedOnHover = (boxCenterX, boxCenterY, style, name) => {
            if (mouseDw.collectionY === Infinity) {
                mouseDw.position.x = boxCenterX - .5 + dimension / 2.
                mouseDw.position.y = boxCenterY + .5 - dimension / 2.

                mouseDw.collectionY = boxCenterY
                
                mouseDw.editingStyle = style
                mouseDw.editingName = name
            }
        }
        addRenderFunction(() => {
            if (mouseDw.mouseIsInside(mouseDw.position) || mouseDw.slideOngoing)
                mouseDw.render(true)
            else {
                mouseDw.collectionY = Infinity
                mouseDw.position.y = Infinity
            }
        })

        //need something like this otherwise window disappears
        rightMouseResponses.push({
            z: () => {
                if (mouseDw.mouseIsInside())
                    return Infinity
                else
                    return -Infinity
            },
            start: () => {
                mouseDw.slideOngoing = true
            },
            during: adjustViewOnMvs,
            end: () => {
                mouseDw.slideOngoing = false
            },
        })
    }

    /////////////////////
    // PRESENTATION DW //
    /////////////////////

    if (MODE !== CODING_MODE) {

        const presentationDws = [
            new DisplayWindow(),
            new DisplayWindow()
        ]

        // let lineNumbers = [1, 4, 5]
        // presentationDws[0].collectionYs = [8.3, 6.300000000000001]
        // presentationDws[1].collectionYs = [6.300000000000001, -2.6999999999999993]

        //could be more like click to put the cursor there and ctrl+click to put another cursor somewhere else
        //the lines of code could be good just for seeing what you're stepping through
        //but you can only do that with some
        // let foilNumber = 0
        // function addToFoilNumber(n) {
        //     foilNumber += n
        //     foilNumber = clamp(foilNumber, 0, presentationDws[0].collectionYs.length - 1)

        //     // presentationDws[0].collectionY = presentationDws[0].collectionYs[foilNumber]
        //     // presentationDws[1].collectionY = presentationDws[1].collectionYs[foilNumber]
        // }
        // bindButton("[", () => {
        //     addToFoilNumber(-1)
        // })
        // bindButton("]", () => {
        //     addToFoilNumber(1)
        // })

        presentationDws.forEach((pdw,rightAsOpposedToLeft)=>{
            updateFunctions.push(() => {
                pdw.position.x = mainCamera.rightAtZZero * .5
                if (!rightAsOpposedToLeft)
                    pdw.position.x *= -1.
                pdw.position.y = 0.
            })
            addRenderFunction(() => {
                pdw.render(false)
            })
        })
    }

    //////////////
    // CARAT DW //
    //////////////
    if (MODE !== PRESENTATION_MODE) {

        {
            const dividerCoords = new Float32Array(quadBuffer.length)
            for (let i = 0; i < quadBuffer.length; ++i) {
                dividerCoords[i] = quadBuffer[i]
                if (i % 4 === 0)
                    dividerCoords[i] *= .1
                if (i % 4 === 1)
                    dividerCoords[i] *= 9999.
            }
            var divider = verticesDisplayWithPosition(dividerCoords, gl.TRIANGLES, 0.0001, 0., 0.)
            addRenderFunction(divider.renderFunction)
        }

        const caratDw = new DisplayWindow()
        updateFunctions.push(() => {
            caratDw.collectionY = carat.position.y

            let padding = 2.2
            divider.position.x = mainCamera.rightAtZZero - dimension - padding
            
            caratDw.position.x = mainCamera.rightAtZZero - dimension / 2. - padding / 2.
            caratDw.position.y = mainCamera.topAtZZero - dimension / 2. - padding / 2.
        })
        addRenderFunction(() => {
            caratDw.render(true)
        })

        let dwButtons = []
        function DwButton(name, onClick) {
            let btn = new ClickableTextbox(name, onClick)

            btn.relativePosition = new ScreenPosition(0., -dimension / 2. - .75 - dwButtons.length)
            dwButtons.push(btn)

            return btn
        }
        updateFunctions.push(() => {
            dwButtons.forEach((btn) => {
                btn.position.copy(caratDw.position)
                btn.position.add(btn.relativePosition)
            })
        })

        function FreeVariableDwButton(name,assignValueToName) {
            DwButton(name, () => {
                let lowestUnusedName = getLowestUnusedName()
                addStringAtCarat(lowestUnusedName)

                assignMv(lowestUnusedName)
                assignValueToName(lowestUnusedName)
            })
        }

        FreeVariableDwButton("point", (name) => {
            point(getNameDrawerProperties(name).value, 0., 0., 0., 1.);
        })
        FreeVariableDwButton("direction", (name) => {
            point(getNameDrawerProperties(name).value, 0., 0., -1., 0.);
        })
        FreeVariableDwButton("line", (name) => {
            realLineX(getNameDrawerProperties(name).value, 1.);
        })
        FreeVariableDwButton("plane", (name) => {
            planeZ(getNameDrawerProperties(name).value, 1.)
        })

        

        // function rectangleWithPosition(halfFrameWidth, halfFrameHeight) {
        //     const frameVertsBuffer = new Float32Array([
        //         halfFrameWidth, halfFrameHeight, 0., 1.,
        //         -halfFrameWidth, halfFrameHeight, 0., 1.,
        //         -halfFrameWidth, halfFrameHeight, 0., 1.,
        //         -halfFrameWidth, -halfFrameHeight, 0., 1.,

        //         -halfFrameWidth, -halfFrameHeight, 0., 1.,
        //         halfFrameWidth, -halfFrameHeight, 0., 1.,
        //         halfFrameWidth, -halfFrameHeight, 0., 1.,
        //         halfFrameWidth, halfFrameHeight, 0., 1.,
        //     ])
        //     return verticesDisplayWithPosition(frameVertsBuffer, gl.LINES, 0., 0., 0.)
        // }
        // const enclosingFrame = rectangleWithPosition(1.8, 1.8 + .5 * dwButtons.length)

        // addRenderFunction(() => {
        //     enclosingFrame.position.copy(caratDw.position)
        //     enclosingFrame.position.y -= .5 * dwButtons.length

        //     enclosingFrame.renderFunction()
        // })

        let modeButtons = []

        let singleOperations = [dual, reverse, polarize]
        //magnitude is relevant only if you're wanting a scalar

        let selectedModeButton = null
        let potentialSuggestions = []
        updateFunctions.push(()=>{
            // Perhaps this should only occur if you have a line with some mvs on it and nothing else

            modeButtons.forEach((modeButton)=>{
                modeButton.r = 0.
            })
            if(selectedModeButton !== null)
                selectedModeButton.r = 1.
            if (selectedModeButton === null)
                return

            let lowestUnusedDwSuggestionDrawingDetailses = 0
            let lowestUnusedPotentialMv = 0
            let numSuggestions = 0
                
            caratDw.collection.forEach((name)=>{
                let nameDp = getNameDrawerProperties(name).value
                if (nameDp.type !== "mv")
                    return
                    
                singleOperations.forEach((op) => {
                    while (potentialSuggestions.length <= lowestUnusedPotentialMv)
                        potentialSuggestions.push(new Float32Array(16))
                    op(nameDp.value, potentialSuggestions[lowestUnusedPotentialMv])
                    
                    if (selectedModeButton.qualifier(potentialMv) === true ) {
                        ++lowestUnusedPotentialMv
                        ++numSuggestions
                    }
                })
            })
            if(numSuggestions > 0) {
                //yeah so, under this interface there's only one suggestion, not much need for this infrastructure
                if (suggestionDrawingDetails.length <= lowestUnusedDwSuggestionDrawingDetailses) {
                    suggestionDrawingDetails.push({ value: new Float32Array(16), type: "mv" })
                    for (let i = 0, il = types["mv"].drawers.length; i < il; ++i)
                        types["mv"].drawers[i].add(lowestUnusedDwSuggestionDrawingDetailses)
                }
                let suggestionToShow = unModdedSuggestionToShow % numSuggestions
                assign(potentialSuggestions[suggestionToShow], suggestionDrawingDetails[lowestUnusedDwSuggestionDrawingDetailses].value )

                caratDw.collection.push(lowestUnusedDwSuggestionDrawingDetailses)
            }
            //the place we're at is that the above is untested

            /*
                n in dw, o operations possible, n(n-1)*o options, each has a grade

                Operations:
                    one (start here)
                        -right-multiply by pss
                        -dual
                        -reverse
                    Outputting Scalar: norms
                    exp and log of course...
                    on two
                        -Project
                        -Inner product
                        -Meet
                        -Join
                        -sandwich
                        -gp
                        -commutator?
                    On three - volume of tetrahedron?


                TODO
                    detecting what you've clicked...
                    motor viz - utah teapot?
                    scalar viz
                    line at infinity viz
                    plane at infinity viz
            */
        })

        let unModdedSuggestionToShow = -1
        updateFunctions.push(()=>{
            if (carat.positionInString !== carat.positionInStringOld) {
                unModdedSuggestionToShow = -1
                selectedModeButton = null
            }
        })
        function ModeButton(name, qualifier){
            let btn = DwButton("constrained " + name, (self) => {
                selectedModeButton = self
                ++unModdedSuggestionToShow //show the suggestion modulo the max number
            })

            btn.qualifier = qualifier

            modeButtons.push(btn)
        }

        // sqrt(x) = exp(.5 log(x))

        //note that grade might be confused if there's some very low numbers
        // ModeButton("scalar",(mv)=>{
        //     return getGrade(mv) === 0
        // })
        // ModeButton("plane", (mv) => {
        //     return getGrade(mv) === 1
        // })
        // ModeButton("line", (mv) => {
        //     return getGrade(mv) === 2
        // })
        // ModeButton("point", (mv) => {
        //     return getGrade(mv) === 3 && pointW(mv) !== 0.
        // })
        // ModeButton("direction", (mv) => {
        //     return getGrade(mv) === 3 && pointW(mv) === 0.
        // })

        // ModeButton("motor", (mv) => {
        //     for(let i = 1; i <= 4; ++i)
        //         if(mv[i] !== 0)
        //             return false
        //     for(let i = 11; i <= 14; ++i)
        //         if(mv[i] !== 0)
        //             return false
        //     for (let i = 0; i <= 16; ++i)
        //         if (mv[i] !== 0)
        //             return true
        //     return false
        // })
    }
}