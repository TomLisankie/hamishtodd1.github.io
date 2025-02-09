//plan for arrays:
//you have to extract them one at a time, because what if they're 4x4 matrices?

function initMentions() {
    
    let style = window.getComputedStyle(textarea)
    let textareaOffsetHorizontal = parseInt(style.padding) + parseInt(style.margin) // can add some fudge to this if you like
    let textareaOffsetVertical = parseInt(style.top) + parseInt(style.padding) + parseInt(style.margin)
    let characterWidth = parseInt(window.getComputedStyle(textMeasurer).width) / 40.

    forEachUsedMention = (func) => {
        variables.forEach((v) => {
            for (let i = 0; i < v.lowestUnusedMention; ++i)
                func(v.mentions[i])
        })
    }

    let $labelLines = []
    function LabelLine() {
        let l = SvgLine()
        $labelLines.push(l)

        return l
    }

    let $labelSides = []
    for(let i = 0; i < 4; ++i)
        $labelSides[i] = LabelLine()
    let $labelConnectors = []
    $labelConnectors.push(LabelLine(), LabelLine(), LabelLine(), LabelLine())

    lineToScreenY = (line) => {
        return line * lineHeight + textareaOffsetVertical - textarea.scrollTop
    }
    columnToScreenX = (column) => {
        return column * characterWidth + textareaOffsetHorizontal - textarea.scrollLeft
    }
    
    hideHighlight = () => {
        $labelLines.forEach((svgLine) => { 
            setSvgLine(svgLine, -10, -10, -10, -10)
        })
        forEachPropt(dws, (dw) => {
            dw.setBorderHighlight(false)
        })
    }

    getIndicatedTextareaMention = (screenX, screenY) => {
        let ret = null
        forEachUsedMention((mention)=>{
            if (inamongstChangedLines(mention.lineIndex) )
                return false

            let y = lineToScreenY(mention.lineIndex)
            let x = columnToScreenX(mention.column)
            let w = mention.charactersWide * characterWidth

            let xyInBox =
                x <= screenX && screenX <= x + w &&
                y <= screenY && screenY < y + lineHeight

            if(xyInBox)
                ret = mention
        })

        return ret
    }

    class Mention {
        variable
        appearance = null
        mentionIndex = -1

        lineIndex = -1
        column = -1
        charactersWide

        //if you have arr[0], then later, arr[1], these are different appearances 
        //and so should not affect each other. Yes they have the same variable, no they should not be compared
        indexInArray = -1
        assignmentToOutput = ""

        constructor(variable) {
            this.variable = variable
        }

        setIndexInArray(indexInArray) {
            if (indexInArray !== this.indexInArray && indexInArray !== -1) {
                for (let i = 0; i < this.variable.type.numFloats; ++i)
                    this.assignmentToOutput += 
                        `    outputFloats[` + i + `] = ` + 
                        this.variable.name + `[` + indexInArray + `]` + 
                        this.variable.type.outputAssignmentPropts[i] + `;\n`
            }

            this.indexInArray = indexInArray
        }

        getFullName() {
            return this.variable.name + (this.indexInArray === -1 ? `` : `[` + this.indexInArray + `]` )
        }

        getAssignmentToOutput() {
            if( this.indexInArray === -1)
                return this.variable.assignmentToOutput
            else
                return this.assignmentToOutput
        }

        highlight() {
            let col = this.variable.col
            $labelLines.forEach((svgLine) => {
                setSvgLineColor(svgLine,col.r,col.g,col.b)
            })

            //mouse box
            let y = lineToScreenY(this.lineIndex)
            let x = columnToScreenX(this.column)
            let w = this.charactersWide * characterWidth

            setSvgHighlight(x, y, w, lineHeight, $labelSides)

            let lowestUnusedLabelConnector = 0
            //this is very shotgunny. Better would be
            forNonFinalDws((dw) => {
                if (this.appearance.isVisibleInDw(dw) ) {
                    let [windowX, windowY] = this.appearance.getWindowCenter(dw)
                    if(windowX === Infinity) 
                        dw.setBorderHighlight(true, col)
                    else {
                        setSvgLine($labelConnectors[lowestUnusedLabelConnector++],
                            x + w,
                            y + lineHeight / 2.,
                            windowX, windowY)
                        dw.setBorderHighlight(false)
                    }
                }
            })
            for (let i = lowestUnusedLabelConnector; i < $labelConnectors.length; ++i)
                setSvgLine($labelConnectors[i], -10, -10, -10, -10)
        }
    }
    window.Mention = Mention

    //a mention can be either an array element or an array
    //a variable is just a name really
    //would you like both to have the same variable?
    //  Well, should have same color, isIn and isUniform. name is dubious

    let randomColor = new THREE.Color()
    let currentHue = 0.
    let goldenRatio = (Math.sqrt(5.) + 1.) / 2.
    class Variable {
        name
        type
        col = new THREE.Color(0., 0., 0.)

        //could have something to indicate it's neither of these. A "variable" I guess
        isIn = false
        isUniform = false

        lowestUnusedMention = 0 //well, index thereof. Maybe change
        mentions = []

        assignmentToOutput = ``
        
        arrayLength = -1
        
        constructor(newName, newClass, newArrayLength) {
            //never changed after this
            this.name = newName
            this.type = newClass
            this.arrayLength = newArrayLength

            for (let i = 0; i < this.type.numFloats; ++i)
                this.assignmentToOutput += `    outputFloats[` + i + `] = ` + this.name + this.type.outputAssignmentPropts[i] + `;\n`

            randomColor.setHSL(currentHue, 1., .5)
            currentHue += 1. / goldenRatio
            while (currentHue > 1.)
                currentHue -= 1.
            this.col.r = randomColor.r; this.col.g = randomColor.g; this.col.b = randomColor.b;

            variables.push(this)
        }

        isArray() {
            return this.arrayLength !== -1
        }

        getLowestUnusedMention() {
            console.assert(this.mentions.length >= this.lowestUnusedMention)
            if (this.mentions.length === this.lowestUnusedMention)
                this.mentions.push(new Mention(this))

            return this.mentions[this.lowestUnusedMention++]
        }
    }
    window.Variable = Variable
}