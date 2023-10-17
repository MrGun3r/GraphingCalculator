
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.height = 800
canvas.width = 800
let exprError = false
const colors = [{r:200,g:0,b:0},{r:0,g:200,b:0},{r:52,g:180,b:235}] // 52, 180, 235
let math = mathjs()
let t = 0
let pause = false
let zoom = 50
let rect = canvas.getBoundingClientRect()
const canvasMagnitude = 100
const magnitudeDiff = 1000
document.querySelector(':root').style.setProperty('--windowH',innerHeight*0.15+"px")
document.querySelector(':root').style.setProperty('--windowW',innerWidth*0.3+"px")
const camera = {
  deltax:0,
  deltay:0,
  x:0,
  y:0
}
const mouse = {
  pressed:false,
  oldx:0,
  oldy:0,
  x:0,
  y:0
}
functions = []
class Plot{
    constructor(ctx,id,color){
      this.ctx = ctx
      this.function = id
      this.bool = false
      // COLOR INDEX  
      this.colorIndex = color 
      this.color = colors[this.colorIndex]
      this.exprError = false 
    }
    init(){
      if(!this.bool){
     var oldy = 0
      }
    this.ctx.save()
    this.ctx.strokeStyle = "rgb("+this.color.r+","+this.color.g+","+this.color.b+")"
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
      for(let x = -canvas.width/(2*zoom)-canvas.width/(2*zoom)%50-(camera.x+camera.deltax)/zoom;x<canvas.width/(2*zoom)+canvas.width/(2*zoom)%50+(-camera.x-camera.deltax)/zoom;x+=1/zoom){
        try {
          let tree = math.parse(this.function,{x:x,t:t})
          var y = tree.eval()
        } catch (error) {
          this.exprError = true
          break
        }
        this.exprError = false
        if(!y && y != 0){
          continue
        }
        if(y > canvasMagnitude*canvas.height/(2*zoom) || y < -canvasMagnitude*canvas.height/(2*zoom)){
          continue
        }

        if(this.bool){     
          if(Math.abs(oldy-y)*zoom<=magnitudeDiff && (y || y == 0)){
            this.ctx.lineTo((x)*zoom+camera.x+camera.deltax,-y*zoom + camera.y+camera.deltay)
          }
          else{
            this.ctx.stroke()
            this.ctx.beginPath()
          }
        }
        oldy = y
        this.bool = true
      }
    this.ctx.stroke()
    this.ctx.restore()
    }  
}
function pauseResume(){
  pause = !pause
  if(pause){
    document.getElementById('pause').innerHTML = "resume"
  }
  else {
    document.getElementById('pause').innerHTML = "pause"
  }
}
function resetTimer(){
  t = 0
}
function clearFunctions(){
 
  for(let i=0;i<functions.length;i++)
  {
    document.getElementById('func'+i).remove()
  }
  functions.length = 0 
}
function addFunction(){
   functions.push(new Plot(ctx,"x",0))


   let newDiv = document.createElement("div")
   newDiv.id = "func"+(functions.length-1)
   let p = document.createElement('p')
   p.innerHTML = "f(x)="
   let text = document.createElement('input')
   text.type = 'text'
   text.id = 'thing'+(functions.length-1)
   text.setAttribute('oninput','changeFunction(id)')
   text.setAttribute('value','x')


   let buttonColor = document.createElement('button')
   buttonColor.id = 'color'+(functions.length-1)
   buttonColor.innerHTML = 'c'
   buttonColor.setAttribute('onclick','changeColor(id)')
   // STYLE BUTTON 
   buttonColor.style.backgroundColor = 'rgb(200,0,0)'
   buttonColor.style.height ='100%'
   buttonColor.style.width = "10%"
   buttonColor.style.borderWidth ='1px'
   // DEL BUTTON 
   let buttonDel = document.createElement('button')
   buttonDel.id = 'del'+(functions.length-1)
   buttonDel.innerHTML = 'x'
   buttonDel.setAttribute('onclick','deleteFunction(id)')

   document.getElementById("functions").insertAdjacentElement('afterbegin',newDiv)
   newDiv.insertAdjacentElement('beforeend',p)
   p.insertAdjacentElement('afterend',text)
   text.insertAdjacentElement('afterend',buttonColor)
   buttonColor.insertAdjacentElement('afterend',buttonDel)
}
function changeFunction(id){
  let index = id.replace('thing','')
  functions[index].function = document.getElementById(id).value
  functions[index].init()
  
  if(functions[index].exprError){
    document.getElementById('thing'+index).style.backgroundColor = "rgba(200,0,0,0.3)"
   }
   else {
     document.getElementById('thing'+index).style.backgroundColor = "rgba(255,255,255,0.5)"
   }
}
function deleteFunction(id){
  let index = id.replace('del','')
  let divNum = document.getElementById('functions').lastElementChild.id.replace('func','')
  for(i=divNum;i<=functions.length;i++){ 
    if(i<index){
      continue 
    }
    else if (i == index){
      functions.splice(index,1)
      document.getElementById('func'+index).remove()
    }
    else{
      document.getElementById('func'+i).id = 'func'+(i-1)
      document.getElementById('color'+i).id = 'color'+(i-1)
      document.getElementById('del'+i).id = 'del'+(i-1)
      document.getElementById('thing'+i).id = 'thing'+(i-1)
    }
  }
}
function changeColor(id){
  let index = id.replace('color','')
  if(functions[index].colorIndex+1 < colors.length){
    functions[index].colorIndex += 1
  }
  else {
    functions[index].colorIndex = 0
  }
  functions[index].color = colors[functions[index].colorIndex]
  document.getElementById(id).style.backgroundColor = "rgb("+functions[index].color.r+","+functions[index].color.g+","+functions[index].color.b+")"
}
function grids(){
    ctx.save()
    var gridSize = zoom
    ctx.globalAlpha = gridSize/100 
    for(let j = ((canvas.width/2+camera.x+camera.deltax)%gridSize)/gridSize;j<(canvas.width-canvas.width%50 - (camera.x-camera.deltax)%gridSize)/gridSize;j++){
      ctx.beginPath()
      ctx.moveTo(j*gridSize,0)
      ctx.lineTo(j*gridSize,canvas.height)
      ctx.stroke()
      ctx.closePath()

    }
    for(let i = ((canvas.height/2+camera.y+camera.deltay)%gridSize)/gridSize;i<(canvas.height-canvas.height%50 -(camera.y-camera.deltay)%gridSize)/gridSize;i++){
        ctx.beginPath()
        ctx.moveTo(0,i*gridSize)
        ctx.lineTo(canvas.width,i*gridSize)
        ctx.stroke()
    }
    ctx.restore()
}
function axis(){
    ctx.save()
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc((canvas.width/2)+camera.x+camera.deltax,(canvas.height/2)+camera.y+camera.deltay,3,0,2*Math.PI)
    ctx.fill()
    ctx.moveTo((canvas.width/2)+camera.x+camera.deltax,0)
    ctx.lineTo((canvas.width/2)+camera.x+camera.deltax,canvas.height)
    ctx.stroke()
    ctx.moveTo(0,(canvas.height/2)+camera.y+camera.deltay)
    ctx.lineTo(canvas.width,(canvas.height/2)+camera.y+camera.deltay)
    ctx.stroke()
    ctx.restore()
}
function AppLoop(){
  // HUD 
    ctx.save()
    ctx.clearRect(0,0,canvas.width,canvas.height)
    grids()
    axis()
    ctx.translate(canvas.width/2,canvas.height/2)
    // DATA
    functions.forEach((func)=>{
      func.init()
    })
    
    ctx.restore()
    // Regenerate data
    
     
    if(mouse.pressed){
      camera.deltax = (mouse.x - mouse.oldx)*1.4
      camera.deltay = (mouse.y - mouse.oldy)*1.4
    }
    requestAnimationFrame(AppLoop)
     
}
setInterval(()=>{
  if(!pause){
    t += 0.05
  document.getElementById('t').innerHTML = "t:"+(math.floor(t*100)/100).toFixed(1)
  }
},50)
functions.push(new Plot(ctx,'sin(x+t)*x',0))

AppLoop()
addEventListener('wheel',(event)=>{
  if(event.deltaY>0 && zoom > 20){
    zoom -= 5
  }
  else if(event.deltaY<0 && zoom < 100){
    zoom += 5
  }
  event.deltaY = 0
  
})
addEventListener('mousedown',(event)=>{
  if(event.button == 0){
    mouse.pressed = true
    mouse.x =    event.x*canvas.width/rect.right
    mouse.y =    event.y*canvas.height/rect.bottom
    mouse.oldx = event.x*canvas.width/rect.right
    mouse.oldy = event.y*canvas.height/rect.bottom
    
  }
})
addEventListener('mouseup',(event)=>{
  if(event.button == 0){
    mouse.pressed = false
    camera.x += camera.deltax
    camera.y += camera.deltay
    camera.deltax = 0
    camera.deltay = 0
  }
})
addEventListener('mousemove',(event)=>{
  if(mouse.pressed){
    mouse.y = event.y*canvas.height/rect.bottom
    mouse.x = event.x*canvas.width/rect.right
  }
})
addEventListener('resize',()=>{
  rect = canvas.getBoundingClientRect()
  document.querySelector(':root').style.setProperty('--windowH',innerHeight*0.1+"px")
  document.querySelector(':root').style.setProperty('--windowW',innerWidth*0.2+"px")
  document.getElementById('window').style.height = innerHeight*0.1+"px"
  document.getElementById('window').style.width = innerWidth*0.2+"px"
})