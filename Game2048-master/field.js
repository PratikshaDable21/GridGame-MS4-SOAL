function Field(canvas, n = 4) {
    this.canvas = canvas 
    this.n = n 
    this.ctx = this.canvas.getContext("2d")

    this.cellSize = 100 
    this.size = this.cellSize * this.n 
    this.paddingTop = 50 
    this.paddingBottom = 10
    this.paddingHor = 10
    
    this.canvas.width = this.size + this.paddingHor * 2 
    this.canvas.height = this.size + this.paddingTop + this.paddingBottom 

    this.fieldColor = "#bdaca0" 
    this.colors = [ 
        "#cdc2b3", "#efe5da", "#ece0c8", "#f0b17d", "#f19867", "#f07e63",
        "#f46141", "#eacf78", "#edcd66", "#ecc75b", "#e8c256", "#e9be4c",
    ]

    this.InitCells() 
    this.AddCell(1) 
    this.AddCell(Math.random() < 0.75 ? 1 : 2) 

    this.score = 0 

    let field = this
    document.addEventListener('keydown', function(e) {
        field.KeyDown(e)
    })
}


Field.prototype.InitCells = function() {
    this.cells = []

    for (let i = 0; i < this.n; i++) {
        this.cells[i] = []

        for (let j = 0; j < this.n; j++)
            this.cells[i][j] = 0
    }
}


Field.prototype.AddCell = function(value) {
    let availablePoints = [] // список пустых клеток

    for (let i = 0; i < this.n; i++)
        for (let j = 0; j < this.n; j++)
            if (this.cells[i][j] == 0)
                availablePoints.push({ i: i, j: j })

    if (availablePoints.length == 0)
        return false

    let point = availablePoints[Math.floor(Math.random() * availablePoints.length)]
    this.cells[point.i][point.j] = value
    return true 
}


Field.prototype.DrawCell = function(i, j) {
    let value = this.cells[i][j]
    let x = this.paddingHor + j * this.cellSize
    let y = this.paddingTop + i * this.cellSize

    this.ctx.fillStyle = this.colors[value]
    this.ctx.fillRect(x + 3, y + 3, this.cellSize - 6, this.cellSize - 6)
    
    if (value == 0)
        return

    this.ctx.fillStyle = value < 3 ? this.fieldColor : "#fff"
    this.ctx.fillText(1 << value, x + this.cellSize / 2, y + this.cellSize / 2)
}


Field.prototype.DrawCells = function() {
    this.ctx.font = this.cellSize / 2.5 +"px Arial"

    for (let i = 0; i < this.n; i++)
        for (let j = 0; j < this.n; j++)
            this.DrawCell(i, j)
}


Field.prototype.Draw = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.beginPath()
    this.ctx.strokeStyle = "#000"
    this.ctx.fillStyle = this.fieldColor
    this.ctx.rect(this.paddingHor, this.paddingTop, this.size, this.size)
    this.ctx.stroke()
    this.ctx.fill()

    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"
    this.ctx.font = this.cellSize / 3 + "px Arial"
    this.ctx.fillText("Score: " + this.score, this.paddingHor + this.size / 2, this.paddingTop / 2 - this.paddingBottom / 2)

    this.DrawCells()
}

Field.prototype.Shift = function(points) {
    let j = 0;
    let wasShift = true
    let result = false

    for (let i = 0; i < points.length; i++) {
        if (this.cells[points[i].i][points[i].j] == 0)
            continue 

        this.cells[points[j].i][points[j].j] = this.cells[points[i].i][points[i].j]

        if (!wasShift && this.cells[points[j].i][points[j].j] == this.cells[points[j - 1].i][points[j - 1].j]) { // если можно схлопнуть
            this.cells[points[j - 1].i][points[j - 1].j]++ // схлопываем
            this.score += 1 << this.cells[points[j - 1].i][points[j - 1].j]
            wasShift = true
            result = true
        }
        else {
            wasShift = false
            result |= j != i
            j++
        }
    }

    for (let i = j; i < points.length; i++)
        this.cells[points[i].i][points[i].j] = 0

    return result
}


Field.prototype.CanShift = function(points) {
    if (this.cells[points[0].i][points[0].j] == 0)
        return true

    for (let i = 1; i < points.length; i++) {
        if (this.cells[points[i].i][points[i].j] == 0)
            return false

        if (this.cells[points[i].i][points[i].j] == this.cells[points[i - 1].i][points[i - 1].j])
            return true
    }

    return false
}

Field.prototype.IsGameOver = function() {
    for (let i = 0; i < this.n; i++) {
        let left = []
        let right = []
        let up = []
        let down = []

        for (let j = 0; j < this.n; j++) {
            left.push({ i: i, j: j })
            right.push({ i: i, j: this.n - 1 - j })
            up.push({ i: j, j: i })
            down.push({ i: this.n - 1 - j, j: i })
        }

        if (this.CanShift(left) || this.CanShift(right))
            return false

        if (this.CanShift(up) || this.CanShift(down))
            return false
    }

    return true
}


Field.prototype.ShiftLeft = function() {
    let result = false

    for (let i = 0; i < this.n; i++) {
        let points = []

        for (let j = 0; j < this.n; j++)
            points.push({ i: i, j: j })

        result |= this.Shift(points)
    }

    return result
}


Field.prototype.ShiftRight = function() {
    let result = false

    for (let i = 0; i < this.n; i++) {
        let points = []

        for (let j = this.n - 1; j >= 0; j--)
            points.push({ i: i, j: j })

        result |= this.Shift(points)
    }

    return result
}


Field.prototype.ShiftUp = function() {
    let result = false

    for (let j = 0; j < this.n; j++) {
        let points = []

        for (let i = 0; i < this.n; i++)
            points.push({ i: i, j: j })

        result |= this.Shift(points)
    }

    return result
}

Field.prototype.ShiftDown = function() {
    let result = false

    for (let j = 0; j < this.n; j++) {
        let points = []

        for (let i = this.n - 1; i >= 0; i--)
            points.push({ i: i, j: j })

        result |= this.Shift(points)
    }

    return result
}

Field.prototype.KeyDown = function(e) {
    let result = false

    if (e.key == "ArrowLeft")
        result = this.ShiftLeft()
    else if (e.key == "ArrowRight")
        result = this.ShiftRight()
    else if (e.key == "ArrowUp")
        result = this.ShiftUp()
    else if (e.key == "ArrowDown")
        result = this.ShiftDown()
    else
        return

    if (result)
        this.AddCell(Math.random() < 0.9 ? 1 : 2)

    this.Draw()

    if (this.IsGameOver())
        alert("Game over")
}
